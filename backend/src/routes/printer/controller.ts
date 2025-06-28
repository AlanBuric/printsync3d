import type { PrinterResponse } from '../../types/data-transfer-objects.js';
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
    return this.mapPrinterToPrinterResponse(PrinterService.getConnectedPrinter(printerId));
  }

  static getPrinters(): PrinterResponse[] {
    return PrinterService.connectedPrinters.values().map(this.mapPrinterToPrinterResponse).toArray();
  }
}
