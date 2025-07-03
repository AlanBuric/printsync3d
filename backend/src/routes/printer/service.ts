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
import EventEmitter from 'events';

const OK_ATTEMPTS = 3;
const REFRESH_LIMIT_MILLISECONDS = 5000;
const RESUME_EVENT = 'resume';

export default class PrinterService {
  private static internalEventEmitter = new EventEmitter();
  static connectedPrinters: Map<string, ConnectedPrinter> = new Map();
  static lastRefresh = Date.now();

  private static async waitForPrinterToBeResumed(path: string) {
    return new Promise<void>((resolve) => {
      const handleContinue = (receivedPath: string) => {
        if (receivedPath == path) {
          this.internalEventEmitter.off(RESUME_EVENT, handleContinue);
          resolve();
        }
      };

      this.internalEventEmitter.on(RESUME_EVENT, handleContinue);
    });
  }

  static async printGCodeModel(printer: ConnectedPrinter, fileStream: Interface, modelId: string) {
    const { serialPort } = printer;

    printer.status.status = 'printing';
    printer.status.currentModel = getDatabase().data.models[modelId]?.displayName ?? modelId;

    try {
      for await (let line of fileStream) {
        // @ts-ignore
        if (printer.status.status == 'idle') {
          console.info(
            `${getLoggingPrefix()} [${printer.portInfo.path}] Model printing stopped by user.`,
          );

          return;
          // @ts-ignore
        } else if (printer.status.status == 'paused') {
          await this.waitForPrinterToBeResumed(printer.portInfo.path);
        }

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
      printer.status.status = 'idle';
      printer.status.currentModel = undefined;

      fileStream.close();

      sseChannel.broadcast(PrinterController.getPrinter(printer.portInfo.path), 'updatePrinter');
    }
  }

  /**
   * Lists currently connected serial ports, removes those that are gone and adds new printer connections if they're missing.
   * @returns True if the printers were changed
   */
  static async refreshConnections() {
    const currentTime = Date.now();

    if (currentTime - this.lastRefresh < REFRESH_LIMIT_MILLISECONDS) {
      return false;
    }

    this.lastRefresh = currentTime;
    const portInfos = await SerialPort.list();

    console.info(`${getLoggingPrefix()} ${portInfos.length} serial ports have been discovered.`);

    const oldPaths = new Set(this.connectedPrinters.keys());
    const newPaths = new Set(portInfos.map(({ path }) => path));
    const difference = oldPaths.difference(newPaths);

    difference.forEach(this.disconnectPrinter);

    await Promise.all(portInfos.map((portInfo) => this.connectPrinter(portInfo)));

    return difference.size != 0;
  }

  static disconnectPrinter(path: string) {
    const existing = this.connectedPrinters.get(path);

    if (existing) {
      if (existing.serialPort.isOpen) existing.serialPort.close();

      this.connectedPrinters.delete(path);
      console.info(
        `${getLoggingPrefix()} Printer ${existing.serialPort.path} has been disconnected.`,
      );
    }
  }

  static async connectPrinter(portInfo: PortInfo) {
    const existingPrinter = this.connectedPrinters.get(portInfo.path);

    if (existingPrinter) {
      existingPrinter.portInfo = portInfo;
      return;
    }

    if (!getDatabase().data.printers[portInfo.path]) {
      getDatabase().data.printers[portInfo.path] = { displayName: portInfo.path };
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
        temperatureReport: {
          extruders: [],
        },
        isFilamentLoaded: false,
        status: 'idle',
      },
      waitingStatusResponses: [],
    };

    this.connectedPrinters.set(portInfo.path, printer);

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
      .on('close', () => this.disconnectPrinter(printer.serialPort.path))
      /**
       * Commands the printer to report temperatures, fans and positions every 15 seconds.
       * Source: https://reprap.org/wiki/G-code#M155:_Automatically_send_temperatures.
       */
      .write('M155 S15 C7\n');
  }

  static sendControl(printer: ConnectedPrinter, controlType: PrinterControlType) {
    printer.serialPort.write(
      PRINTER_CONTROLS[controlType].map((command) => command + '\n').join(''),
    );

    switch (controlType) {
      case 'pause':
        printer.status.status = 'paused';
        break;
      case 'cancel':
        printer.status.status = 'idle';
        printer.status.currentModel = undefined;
        break;
      case 'resume':
        if (printer.status.currentModel) {
          printer.status.status = 'printing';
          this.internalEventEmitter.emit(RESUME_EVENT, printer.portInfo.path);
          break;
        }

        return;
      case 'preheatAbs':
      case 'preheatPla':
      case 'preheatPet':
        printer.status.lastPreheatOption = controlType;
        break;
    }

    sseChannel.broadcast(printer, 'updatePrinter');
  }

  static getConnectedPrinter(path: string): ConnectedPrinter {
    const printer = this.connectedPrinters.get(path);

    if (!printer)
      throw new RequestError(StatusCodes.NOT_FOUND, `Printer with path ${path} doesn't exist`);

    return printer;
  }
}
