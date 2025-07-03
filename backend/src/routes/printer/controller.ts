import type { Request, Response } from 'express';
import type { PrinterResponse } from '../../types/data-transfer-objects.js';
import PrinterService from './service.js';
import type { ConnectedPrinter, PrinterControlType } from '../../types/types.js';
import { getDatabase } from '../../database/database.js';
import { sseChannel } from '../server-side-events.js';
import { matchedData } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { PRINTER_CONTROL_TYPES } from '../../types/controls.js';
import ModelService from '../model/service.js';

type EditPrinterRequest = { printerId: string; displayName: string };
type DisconnectPrinterRequest = { printerId: string };
type PrinterControlRequest = { printerId: string; controlType: PrinterControlType };
type PrintModelRequest = { printerId: string; modelId: string };

export default class PrinterController {
  private static mapPrinterToPrinterResponse(printer: ConnectedPrinter): PrinterResponse {
    const printerId = printer.portInfo.path;

    return {
      ...printer.status,
      displayName: getDatabase().data.printers[printerId]?.displayName ?? printerId,
      printerId,
    };
  }

  private static getAllPrintersFromService(): PrinterResponse[] {
    return PrinterService.connectedPrinters
      .values()
      .map(PrinterController.mapPrinterToPrinterResponse)
      .toArray();
  }

  static async broadcastPrinterUpdate(printerId: string) {
    sseChannel.broadcast(
      PrinterController.mapPrinterToPrinterResponse(PrinterService.getConnectedPrinter(printerId)),
      'updatePrinter',
    );
  }

  static getAllPrinters(_request: Request, response: Response<PrinterResponse[]>) {
    response.send(PrinterController.getAllPrintersFromService());
  }

  static async refreshAndGetAllPrinters(
    _request: Request,
    response: Response<PrinterResponse[]>,
  ): Promise<any> {
    const areChanged = await PrinterService.refreshConnections();
    const printers = PrinterController.getAllPrintersFromService();

    response.send(printers);

    if (areChanged) {
      sseChannel.broadcast(printers, 'updatePrinters');
    }
  }

  static getPrinter(request: Request, response: Response<PrinterResponse>) {
    const { printerId } = matchedData<{ printerId: string }>(request);

    PrinterController.mapPrinterToPrinterResponse(PrinterService.getConnectedPrinter(printerId));
  }

  static async editPrinter(request: Request, response: Response): Promise<any> {
    const { printerId, displayName } = matchedData<EditPrinterRequest>(request);
    const printer = getDatabase().data.printers[printerId];

    if (!printer) {
      return response.sendStatus(StatusCodes.NOT_FOUND);
    }

    if (printer.displayName == displayName) {
      return response.sendStatus(StatusCodes.OK);
    }

    printer.displayName = displayName;

    await getDatabase()
      .write()
      .then(() => {
        response.sendStatus(StatusCodes.OK);
        sseChannel.broadcast(PrinterService.getConnectedPrinter(printerId), 'updatePrinter');
      });
  }

  static async disconnectPrinter<DeletePrinterRequest>(request: Request, response: Response) {
    const { printerId } = matchedData(request);

    PrinterService.disconnectPrinter(printerId);

    response.sendStatus(StatusCodes.OK);

    sseChannel.broadcast(printerId, 'deletePrinter');
  }

  static getControlTypes(_request: Request, response: Response<PrinterControlType[]>) {
    response.send(PRINTER_CONTROL_TYPES);
  }

  static async controlPrinter(request: Request, response: Response): Promise<void> {
    const { printerId, controlType } = matchedData<PrinterControlRequest>(request);

    PrinterService.sendControl(PrinterService.getConnectedPrinter(printerId), controlType);

    response.sendStatus(StatusCodes.OK);
  }

  static async printModel(request: Request, response: Response): Promise<void> {
    const { printerId, modelId } = matchedData<PrintModelRequest>(request);
    const printer = PrinterService.getConnectedPrinter(printerId);

    if (printer.status.currentModel) {
      response.status(StatusCodes.FORBIDDEN).send('Printer already has a selected model');
      return;
    }

    PrinterService.printGCodeModel(printer, ModelService.getModelFileStream(modelId), modelId);

    response.sendStatus(StatusCodes.OK);
  }
}
