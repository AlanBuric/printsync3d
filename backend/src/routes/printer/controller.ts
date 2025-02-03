import { PrinterResponse } from '../../types/data-transfer-objects.ts';
import RequestError from '../../util/RequestError.ts';
import { StatusCodes } from 'npm:http-status-codes@2.3.0';
import PrinterService from './service.ts';
import { ConnectedPrinter } from '../../types/types.ts';
import { getDatabase } from '../../database/database.ts';

export default class PrinterController {
  static mapPrinterToPrinterResponse(printer: ConnectedPrinter): PrinterResponse {
    const printerId = printer.portInfo.path;

    return {
      ...printer.status,
      displayName: getDatabase().data.printers[printerId]?.displayName ?? printerId,
      printerId,
    };
  }

  static getPrinter(path: string): PrinterResponse {
    const printer = PrinterService.connectedPrinters[path];

    if (!printer) {
      throw new RequestError(
        StatusCodes.NOT_FOUND,
        `Printer with printer ID ${path} not found`,
      );
    }

    return this.mapPrinterToPrinterResponse(printer);
  }

  static getPrinters(): PrinterResponse[] {
    return Object.values(PrinterService.connectedPrinters).map(this.mapPrinterToPrinterResponse);
  }
}