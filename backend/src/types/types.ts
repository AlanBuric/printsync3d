import PRINTER_CONTROLS from '../routes/printer/known-controls.ts';
import { PortInfo } from 'npm:@serialport/bindings-cpp@13.0.0';
import { ReadlineParser, SerialPort } from 'npm:serialport@13.0.0';

export type AxesPosition = {
  x: number;
  y: number;
  z: number;
};

/**
 * Printer temperatures from the expected M105 command response
 */
export type TemperatureReport = {
  /**
   * Single-extruder firmware might report "T:190 /210"
   */
  extruder?: string;
  /**
   * Multi-extruder firmware might report "T0:90 /100" or "T1:80/150" etc.
   */
  extruders: Record<number, string>;
  /**
   * Bed temperature, e.g. "B:80 /50"
   */
  bed?: string;

  /**
   * Chamber temperature, e.g. "C:28 /50"
   */
  chamber?: string;
};

export type PrinterStatus = {
  progress: number;
  currentModel?: string;
  temperatureReport: TemperatureReport;
  currentAxesPosition: AxesPosition;
  isFilamentLoaded: boolean;
  isPaused: boolean;
};

export type PrinterControlType = keyof typeof PRINTER_CONTROLS;

export type ConnectedPrinter = {
  status: PrinterStatus;
  parser: ReadlineParser;
  serialPort: SerialPort;
  portInfo: PortInfo;
  waitingStatusResponses: Response[];
};

export type StoredPrinter = {
  /**
   * Display name of the model as originally uploaded by the user or custom set afterward.
   */
  displayName: string;
};

export type StoredModel = {
  /**
   * Display name of the model as originally uploaded by the user or custom set afterward.
   */
  displayName: string;
};
