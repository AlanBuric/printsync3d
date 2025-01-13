import PRINTER_CONTROLS from './known-controls.js';
import { ConnectedPrinter, Printer, PrinterControlType } from '../../types/types.js';
import { ReadlineParser, SerialPort } from 'serialport';
import { PortInfo } from '@serialport/bindings-cpp';
import RequestError from '../../util/RequestError.js';
import { StatusCodes } from 'http-status-codes';
import express from 'express';
import getLoggingPrefix from '../../util/logging.js';
import PrintSync3DConfig from '../../config/config.js';
import { getDatabase } from '../../database/database.js';
import {Interface} from 'readline';

export default class PrinterService {
  static connectedPrinters: Record<string, ConnectedPrinter> = {};
  static isRefreshing = false;

  static async printGCodeModel(connectedPrinter: ConnectedPrinter, fileStream: Interface, fileId: string) {
    const connection = connectedPrinter.serialPort;

    connectedPrinter.printer.status.currentModel = getDatabase().data.models[fileId] ?? fileId;
    connectedPrinter.printer.status.isPaused = false;

    try {
      for await (const line of fileStream) {
        connection.write(line);
        connectedPrinter.printer.status.progress++;
      }
    } catch (error) {
      console.error(
        `${getLoggingPrefix()} Error occurred while writing GCODE model to 3D printer ${connectedPrinter.serialPortInfo.path}`,
        error,
      );
      throw new RequestError(StatusCodes.NOT_FOUND, `GCODE model with ID ${fileId} not found.`);
    }
  }

  static async refreshConnections() {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    const portInfos = await SerialPort.list();

    console.log(`${getLoggingPrefix()} ${portInfos.length} serial ports have been discovered.`);

    const oldPaths = new Set(Object.keys(this.connectedPrinters));
    const newPaths = new Set(portInfos.map((portInfo) => portInfo.path));

    oldPaths.difference(newPaths).forEach(this.removePrinter);

    await Promise.allSettled(portInfos.map(this.connectPrinter));

    setTimeout(
      () => (this.isRefreshing = false),
      PrintSync3DConfig.SERIAL_PORT_REFRESH_LIMIT_MILLISECONDS,
    );
  }

  static removePrinter(path: string) {
    const existing = this.connectedPrinters[path];

    if (existing) {
      existing.serialPort.close();
      delete this.connectedPrinters[path];
    }
  }

  static async connectPrinter(portInfo: PortInfo) {
    const existing = this.connectedPrinters[portInfo.path];

    if (existing) {
      existing.serialPortInfo = portInfo;
    } else {
      const connectedPrinter = (this.connectedPrinters[portInfo.path] =
        this.createConnectedPrinter(portInfo));

      connectedPrinter.serialPort
        .pipe(new ReadlineParser())
        .on('data', (status: string) =>
          connectedPrinter.waitingStatusResponses.forEach((response) =>
            response.json({
              path: portInfo.path,
              status,
            }),
          ),
        )
        .on('close', () => {
          delete this.connectedPrinters[portInfo.path];
        });
    }
  }

  static createConnectedPrinter(portInfo: PortInfo, name = 'Unknown device'): ConnectedPrinter {
    const serialPort = PrinterService.createAndOpenSerialPort(portInfo.path);

    serialPort.on('error', (error: Error) =>
      console.error(`${getLoggingPrefix()} Error occurred on SerialPort ${portInfo.path}`, error),
    );

    return {
      serialPort,
      printer: {
        name,
        status: {
          progress: 0,
          currentModel: undefined,
          currentTemperature: 0,
          currentAxesPosition: {
            x: 0,
            y: 0,
            z: 0,
          },
          isFilamentLoaded: false,
          isPaused: false,
        },
      },
      serialPortInfo: portInfo,
      waitingStatusResponses: [],
    };
  }

  static sendGCode(connectedPrinter: ConnectedPrinter, controlType: PrinterControlType) {
    return connectedPrinter.serialPort.write(PRINTER_CONTROLS[controlType].join('\n'));
  }

  static getConnectedPrinter(path: string): ConnectedPrinter {
    const connectedPrinter = this.connectedPrinters[path];

    if (!connectedPrinter) {
      throw new RequestError(StatusCodes.NOT_FOUND, `Printer with path ${path} doesn't exist`);
    }

    return connectedPrinter;
  }

  static createAndOpenSerialPort(path: string): SerialPort {
    return new SerialPort({
      baudRate: PrintSync3DConfig.BAUD_RATE,
      path: path,
    });
  }

  static getPrinters(): Printer[] {
    return Object.values(this.connectedPrinters).map((printer) => printer.printer);
  }

  static handleStatus(connectedPrinter: ConnectedPrinter, response: express.Response): void {
    connectedPrinter.waitingStatusResponses.push(response);

    if (!connectedPrinter.waitingStatusResponses.length) {
      this.sendGCode(connectedPrinter, 'status');
    }
  }
}
