import { SerialPort } from 'serialport';

export type StoreSchema = {
  commandQueues: Record<string, Array<string>>;
  connections: Record<string, SerialPort>;
  printers: Record<string, string>;
}

const store: StoreSchema = {
  commandQueues: {},
  connections: {},
  printers: {}
};

export async function initializeStore() {
  const printers = Object.fromEntries((await SerialPort.list()).map(info => [info.path, info.serialNumber]));

  Object.assign(store.printers, printers);
}

export default function getStore() {
  return store;
}