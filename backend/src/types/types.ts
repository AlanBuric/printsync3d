import type { PortInfo } from '@serialport/bindings-cpp';
import { ReadlineParser, SerialPort } from 'serialport';
import type { PrinterStatus } from './data-transfer-objects.ts';

export type ConnectedPrinter = {
  status: PrinterStatus;
  parser: ReadlineParser;
  serialPort: SerialPort;
  portInfo: PortInfo;
  waitingStatusResponses: Response[];
};
