import PRINTER_CONTROLS from '../../gcode/known-controls.js';
import { Printer, PrinterControlType } from '../../types/types.js';
import { SerialPort } from 'serialport';

const commandQueues: Record<string, string[]> = {};
const connections: Record<string, SerialPort> = {};
let printers: Record<string, Printer> = {};

export default class PrinterService {
  static startPrinting(printerId: string) {
    const queue = commandQueues[printerId];
    const connection = this.getConnection(printerId) ?? this.createConnection(printerId);

    const processQueue = () => {
      if (queue.length === 0) {
        setTimeout(processQueue, 100);
        return;
      }

      const gCode = queue.shift();

      connection.write(`${gCode}\n`, (error) => {
        if (error) {
          console.error(`Failed to send GCode ${gCode} to ${printerId}: ${error.message}`);
        } else {
          processQueue();
        }
      });
    };

    processQueue();
  }

  static async refreshConnections() {
    console.log('Listing connected serial ports...');

    const serialPorts = await SerialPort.list();

    console.log(`${serialPorts.length} serial ports have been discovered.`);

    printers = Object.fromEntries(serialPorts.map(port => ([port.path, this.createPrinter(port)])));
  }

  static createPrinter(port: Awaited<ReturnType<typeof SerialPort.list>>[number], name = 'Unknown printer'): Printer {
    return {
      name,
      status: {
        progress: 0,
        currentModel: undefined,
        currentTemperature: 0,
        currentAxesPosition: {
          x: 0,
          y: 0,
          z: 0
        },
        isFilamentLoaded: false,
        isPaused: false
      },
      usb: {
        baudRate: 115200,
        usbVendorId: port.vendorId ?? '',
        path: port.path,
        productId: port.productId ?? ''
      }
    };
  }

  static sendGCode(printerId: string, controlType: PrinterControlType) {
    commandQueues[printerId].unshift(...PRINTER_CONTROLS[controlType]);
  }

  static getConnection(path: string): SerialPort | undefined {
    return connections[path];
  }

  static createConnection(path: string): SerialPort {
    return connections[path] = new SerialPort({
      path: path,
      baudRate: 115200,
      autoOpen: false
    });
  }

  static closeConnection(path: string) {
    return new Promise((resolve, reject) => {
      connections[path].close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  static getPrinters(): Printer[] {
    return Object.values(printers);
  }
}