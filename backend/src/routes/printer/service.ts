import PRINTER_CONTROLS from "./known-controls.ts";
import { ConnectedPrinter, PrinterControlType } from "../../types/types.ts";
import { getDatabase } from "../../database/database.ts";
import { PortInfo } from "npm:@serialport/bindings-cpp";
import { StatusCodes } from "npm:http-status-codes@2.3.0";
import getLoggingPrefix from "../../util/logging.ts";
import PrintSync3DConfig from "../../config/config.ts";
import RequestError from "../../util/RequestError.ts";
import { parseTemperatureReport } from "./reporting.ts";
import { SerialPort } from "npm:serialport@13.0.0";

const OK_ATTEMPTS = 4;
const SERIAL_PORT_REFRESH_LIMIT_MILLISECONDS = 5000;

export default class PrinterService {
  static connectedPrinters: Record<string, ConnectedPrinter> = {};
  static isRefreshing = false;

  static async printGCodeModel(
    printer: ConnectedPrinter,
    lineStream: Promise<ReadableStream<string>>,
    modelId: string,
  ) {
    const connection = printer.serialPort;

    printer.status.currentModel =
      getDatabase().data.models[modelId]?.displayName ?? modelId;
    printer.status.progress = 0;

    try {
      for await (const line of lineStream) {
        console.info(
          `${getLoggingPrefix()} [${printer.portInfo.path}] Write '${line}'`,
        );

        connection.write(line);

        for (let i = 0; i < OK_ATTEMPTS; i++) {
          const response: string = await new Promise((resolve) => {
            printer.parser.once("data", (data) => resolve(data));
          });

          if (response.startsWith("ok")) {
            console.info(response);
            break;
          }
        }

        // TODO: tell the printer the overall file progress via M73
        printer.status.progress++;
      }
    } catch (error) {
      console.error(
        `${getLoggingPrefix()} Error occurred while writing GCODE model ${printer.status.currentModel} with ID ${modelId} to 3D printer ${printer.portInfo.path}`,
      );
      console.error(error);
    } finally {
      printer.status.currentModel = undefined;
    }
  }

  /**
   * Lists currently connected serial ports, removes those that are gone and adds new printer connections if they're missing.
   */
  static async refreshConnections() {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    const portInfos = await SerialPort.list();

    console.info(
      `${getLoggingPrefix()} ${portInfos.length} serial ports have been discovered.`,
    );

    const oldPaths = new Set(Object.keys(this.connectedPrinters));
    const newPaths = new Set(portInfos.map((portInfo) => portInfo.path));

    oldPaths.difference(newPaths).forEach(this.removePrinter);

    await Promise.allSettled(portInfos.map(this.connectPrinter));

    setTimeout(
      () => (this.isRefreshing = false),
      SERIAL_PORT_REFRESH_LIMIT_MILLISECONDS,
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
      existing.portInfo = portInfo;
      return;
    }

    const serialPort = new SerialPort({
      baudRate: PrintSync3DConfig.BAUD_RATE,
      path: portInfo.path,
    });

    serialPort.on("error", (error: Error) =>
      console.error(
        `${getLoggingPrefix()} Error occurred on SerialPort ${portInfo.path}`,
        error,
      ),
    );

    const parser = new ReadlineParser({ delimiter: "\r\n" });

    const printer: ConnectedPrinter = {
      serialPort,
      portInfo,
      parser,
      status: {
        progress: 0,
        currentModel: undefined,
        temperatureReport: {
          extruders: {},
        },
        currentAxesPosition: {
          x: 0,
          y: 0,
          z: 0,
        },
        isFilamentLoaded: false,
        isPaused: false,
      },
      waitingStatusResponses: [],
    };
    this.connectedPrinters[portInfo.path] = printer;

    parser.on("data", (data: string) => {
      console.info(`${getLoggingPrefix()} Received ${data}`);

      if (data.includes("T")) {
        printer.status.temperatureReport = parseTemperatureReport(data);
      }
    });

    serialPort
      .pipe(parser)
      .on("close", () => delete this.connectedPrinters[portInfo.path])
      /**
       * Commands the printer to report temperatures, fans and positions every 20 seconds.
       * Source: https://reprap.org/wiki/G-code#M155:_Automatically_send_temperatures.
       */
      .write("M155 S20 C7\n");
  }

  static sendGCode(printer: ConnectedPrinter, controlType: PrinterControlType) {
    return printer.serialPort.write(
      PRINTER_CONTROLS[controlType].join("\n") + "\n",
    );
  }

  static getConnectedPrinter(path: string): ConnectedPrinter {
    const printer = this.connectedPrinters[path];

    if (!printer) {
      throw new RequestError(
        StatusCodes.NOT_FOUND,
        `Printer with path ${path} doesn't exist`,
      );
    }

    return printer;
  }
}
