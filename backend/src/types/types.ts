import PRINTER_CONTROLS from '../routes/printer/known-controls.js';
import { PortInfo } from '@serialport/bindings-cpp';
import { SerialPort } from 'serialport';
import { Response } from 'express';

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
};

export type PrinterControlType = keyof typeof PRINTER_CONTROLS;

export type ConnectedPrinter = {
  printer: Printer;
  serialPort: SerialPort;
  serialPortInfo: PortInfo;
  waitingStatusResponses: Response[];
};

export type StoredPrinter = {
  displayName: string;
};
