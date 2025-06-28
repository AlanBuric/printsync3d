import PRINTER_CONTROLS from '../../types/controls.js';
import type { ConnectedPrinter, PortInfo, PrinterControlType } from '../../types/types.js';
import { ReadlineParser, SerialPort } from 'serialport';
import { getDatabase } from '../../database/database.js';
import { StatusCodes } from 'http-status-codes';
import getLoggingPrefix from '../../util/logging.js';
import EnvConfig from '../../config/config.js';
import RequestError from '../../util/RequestError.js';
import { Interface } from 'readline';
import { parseTemperatureReport } from './reporting.js';
import { sseChannel } from '../server-side-events.js';
import PrinterController from './controller.js';

const OK_ATTEMPTS = 3;
const REFRESH_LIMIT_MILLISECONDS = 5000;

export default class PrinterService {
  static connectedPrinters: Record<string, ConnectedPrinter> = {};
  static lastRefresh = Date.now();

  static async printGCodeModel(printer: ConnectedPrinter, fileStream: Interface, modelId: string) {
    const { serialPort } = printer;

    printer.status.currentModel = getDatabase().data.models[modelId]?.displayName ?? modelId;

    try {
      for await (let line of fileStream) {
        // Ignore comments.
        if (line.startsWith(';')) continue;

        // Remove the comment at the end.
        line = line.split(';')[0].trim();

        // Skip blank lines.
        if (!line) continue;

        console.info(`${getLoggingPrefix()} [${serialPort.path}] Write '${line}'`);
        serialPort.write(line);

        for (let i = 0; i < OK_ATTEMPTS; i++) {
          const response: string = await new Promise((resolve) => {
            printer.parser.once('data', (data) => resolve(data));
          });

          if (response.startsWith('ok')) {
            console.info(`${getLoggingPrefix()} [${serialPort.path}] response`);
            break;
          }
        }
      }
    } catch (error) {
      console.error(
        `${getLoggingPrefix()} Error occurred while writing GCODE model ${printer.status.currentModel} with ID ${modelId} to 3D printer ${printer.portInfo.path}`,
      );
      console.error(error);
    } finally {
      printer.status.currentModel = undefined;
      fileStream.close();
    }
  }

  /**
   * Lists currently connected serial ports, removes those that are gone and adds new printer connections if they're missing.
   */
  static async refreshConnections() {
    const currentTime = Date.now();

    if (currentTime - this.lastRefresh < REFRESH_LIMIT_MILLISECONDS) {
      return;
    }

    this.lastRefresh = currentTime;
    const portInfos = await SerialPort.list();

    console.info(`${getLoggingPrefix()} ${portInfos.length} serial ports have been discovered.`);

    const oldPaths = new Set(Object.keys(this.connectedPrinters));
    const newPaths = new Set(portInfos.map((portInfo) => portInfo.path));

    oldPaths.difference(newPaths).forEach(this.disconnectPrinter);

    await Promise.allSettled(portInfos.map(this.connectPrinter));
  }

  static disconnectPrinter(path: string) {
    const existing = this.connectedPrinters[path];

    if (existing) {
      existing.serialPort.close();
      delete this.connectedPrinters[path];
    }
  }

  static async connectPrinter(portInfo: PortInfo) {
    const existing = this.connectedPrinters[portInfo.path];

    if (existing) {
      existing.portInfo = portInfo;
      return;
    }

    const serialPort = new SerialPort({
      baudRate: EnvConfig.BAUD_RATE,
      path: portInfo.path,
    });

    serialPort.on('error', (error: Error) =>
      console.error(`${getLoggingPrefix()} Error occurred on SerialPort ${portInfo.path}`, error),
    );

    const parser = new ReadlineParser({ delimiter: '\r\n' });

    const printer: ConnectedPrinter = {
      serialPort,
      portInfo,
      parser,
      status: {
        currentModel: undefined,
        temperatureReport: {
          extruders: [],
        },
        isFilamentLoaded: false,
      },
      waitingStatusResponses: [],
    };
    this.connectedPrinters[portInfo.path] = printer;

    parser.on('data', (data: string) => {
      console.info(`${getLoggingPrefix()} [${portInfo.path}] ${data}`);

      if (data.includes('T')) {
        printer.status.temperatureReport = parseTemperatureReport(data);

        sseChannel.broadcast(
          PrinterController.mapPrinterToPrinterResponse(printer),
          'updatePrinter',
        );
      }
    });

    serialPort
      .pipe(parser)
      .on('close', () => delete this.connectedPrinters[portInfo.path])
      /**
       * Commands the printer to report temperatures, fans and positions every 15 seconds.
       * Source: https://reprap.org/wiki/G-code#M155:_Automatically_send_temperatures.
       */
      .write('M155 S15 C7\n');
  }

  static sendGCode(printer: ConnectedPrinter, controlType: PrinterControlType) {
    printer.serialPort.write(PRINTER_CONTROLS[controlType].join('\n') + '\n');

    switch (controlType) {
      case 'preheatAbs':
      case 'preheatPla':
      case 'preheatPet':
        printer.status.lastPreheatOption = controlType;
        break;
    }
  }

  static getConnectedPrinter(path: string): ConnectedPrinter {
    const printer = this.connectedPrinters[path];

    if (!printer) {
      throw new RequestError(StatusCodes.NOT_FOUND, `Printer with path ${path} doesn't exist`);
    }

    return printer;
  }
}
