import PRINTER_CONTROLS from './known-controls.js';
import { ConnectedPrinter, PrinterControlType } from '../../types/types.js';
import { ReadlineParser, SerialPort } from 'serialport';
import { getDatabase } from '../../database/database.js';
import { PortInfo } from '@serialport/bindings-cpp';
import { StatusCodes } from 'http-status-codes';
import getLoggingPrefix from '../../util/logging.js';
import PrintSync3DConfig from '../../config/config.js';
import RequestError from '../../util/RequestError.js';
import { Interface } from 'readline';
import express from 'express';

export default class PrinterService {
  static connectedPrinters: Record<string, ConnectedPrinter> = {};
  static isRefreshing = false;

  static async printGCodeModel(printer: ConnectedPrinter, fileStream: Interface, modelId: string) {
    const connection = printer.serialPort;

    printer.status.currentModel = getDatabase().data.models[modelId]?.displayName ?? modelId;
    printer.status.isPaused = false;

    try {
      for await (const line of fileStream) {
        connection.write(line);
        printer.status.progress++;
      }
    } catch (error) {
      console.error(
        `${getLoggingPrefix()} Error occurred while writing GCODE model with ID ${modelId} to 3D printer ${printer.serialPortInfo.path}`,
        error,
      );
      throw new RequestError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `An error occurred while 3D printing model ${printer.status.currentModel}.`,
      );
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
      return;
    }

    const printer = (this.connectedPrinters[portInfo.path] = this.createConnectedPrinter(portInfo));

    printer.serialPort
      .pipe(new ReadlineParser())
      .on('data', (status: string) =>
        printer.waitingStatusResponses.forEach((response) =>
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

  static createConnectedPrinter(portInfo: PortInfo): ConnectedPrinter {
    const serialPort = PrinterService.createAndOpenSerialPort(portInfo.path);

    serialPort.on('error', (error: Error) =>
      console.error(`${getLoggingPrefix()} Error occurred on SerialPort ${portInfo.path}`, error),
    );

    return {
      serialPort,
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
      serialPortInfo: portInfo,
      waitingStatusResponses: [],
    };
  }

  static sendGCode(printer: ConnectedPrinter, controlType: PrinterControlType) {
    return printer.serialPort.write(PRINTER_CONTROLS[controlType].join('\n'));
  }

  static getConnectedPrinter(path: string): ConnectedPrinter {
    const printer = this.connectedPrinters[path];

    if (!printer) {
      throw new RequestError(StatusCodes.NOT_FOUND, `Printer with path ${path} doesn't exist`);
    }

    return printer;
  }

  static createAndOpenSerialPort(path: string): SerialPort {
    return new SerialPort({
      baudRate: PrintSync3DConfig.BAUD_RATE,
      path: path,
    });
  }

  static handleStatus(printer: ConnectedPrinter, response: express.Response): void {
    printer.waitingStatusResponses.push(response);

    if (!printer.waitingStatusResponses.length) {
      this.sendGCode(printer, 'status');
    }
  }
}
