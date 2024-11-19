export type PrinterUsbConnection = {
  baudRate: number;
  usbVendorId: string;
  productId: string;
  port: string;
};

export type AxesPosition = {
  x: number;
  y: number;
  z: number;
};

export type PrinterStatus = {
  progress: number;
  currentModel: string;
  currentTemperature: string;
  currentAxesPosition: AxesPosition;
  paused: boolean;
};

export type Printer = {
  name: string;
  status: PrinterStatus,
  usb: PrinterUsbConnection
};
