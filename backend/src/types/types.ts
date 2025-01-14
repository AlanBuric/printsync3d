import PRINTER_CONTROLS from '../routes/printer/known-controls.js';
import { PortInfo } from '@serialport/bindings-cpp';
import { SerialPort } from 'serialport';
import { Response } from 'express';

export type AxesPosition = {
  x: number;
  y: number;
  z: number;
};

export type Printer = {
  progress: number;
  currentModel?: string;
  currentTemperature: number;
  currentAxesPosition: AxesPosition;
  isFilamentLoaded: boolean;
  isPaused: boolean;
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

export type StoredModel = {
  /**
   * Display name of the model as originally uploaded by the user or custom set.
   */
  displayName: string;
}