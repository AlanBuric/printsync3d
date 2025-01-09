import { SerialPort } from 'serialport';
import PrinterService from '../printer/service.js';

export default class StatusService {
  static async getSerialConnection(printerPath: string): Promise<SerialPort> {
    let port = PrinterService.getSerialConnection(printerPath);

    if (port) {
      return port;
    }

    port = PrinterService.createConnection(printerPath);

    return new Promise((resolve, reject) => {
      port.open((error) => {
        if (error) {
          console.error(`Error opening port for ${printerPath}:`, error.message);
          return reject(error);
        }

        return resolve(port);
      });
    });
  }
}
