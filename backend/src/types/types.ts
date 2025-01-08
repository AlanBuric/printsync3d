import { PRINTER_CONTROL_TYPES } from '../gcode/known-controls.js';

export type PrinterUsbConnection = {
  baudRate: number;
  usbVendorId: string;
  productId: string;
  path: string;
};

export type AxesPosition = {
  x: number;
  y: number;
  z: number;
};

export type PrinterStatus = {
  progress: number;
  currentModel?: string;
  currentTemperature: number;
  currentAxesPosition: AxesPosition;
  isFilamentLoaded: boolean;
  isPaused: boolean;
};

export type Printer = {
  name: string;
  status: PrinterStatus;
  usb: PrinterUsbConnection;
};

export type PrinterControlType = (typeof PRINTER_CONTROL_TYPES)[number];
