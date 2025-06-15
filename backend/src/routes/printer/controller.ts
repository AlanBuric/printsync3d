import type { PrinterResponse } from '../../types/data-transfer-objects.js';
import RequestError from '../../util/RequestError.js';
import { StatusCodes } from 'http-status-codes';
import PrinterService from './service.js';
import type { ConnectedPrinter } from '../../types/types.js';
import { getDatabase } from '../../database/database.js';

export default class PrinterController {
  static mapPrinterToPrinterResponse(printer: ConnectedPrinter): PrinterResponse {
    const printerId = printer.portInfo.path;

    return {
      ...printer.status,
      displayName: getDatabase().data.printers[printerId]?.displayName ?? printerId,
      printerId,
    };
  }

  static getPrinter(printerId: string): PrinterResponse {
    const printer = PrinterService.connectedPrinters[printerId];

    if (!printer) {
      throw new RequestError(
        StatusCodes.NOT_FOUND,
        `Printer with printer ID ${printerId} not found`,
      );
    }

    return this.mapPrinterToPrinterResponse(printer);
  }

  static getPrinters(): PrinterResponse[] {
    return Object.values(PrinterService.connectedPrinters).map(this.mapPrinterToPrinterResponse);
  }
}
