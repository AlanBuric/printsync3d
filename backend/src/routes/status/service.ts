import { SerialPort } from 'serialport';
import getStore from '../../store/store.js';

export default class StatusService {
  static  getSerialConnection(printerId: string): SerialPort {
    if (getStore().connections[printerId]) {
      return getStore().connections[printerId];
    }

    const port = new SerialPort({
      path: printerId,
      baudRate: 115200,
      autoOpen: false
    });

    getStore().connections[printerId] = port;

    port.open((err) => {
      if (err) {
        console.error(`Error opening port for ${printerId}:`, err.message);
      }
    });

    return port;
  }
}