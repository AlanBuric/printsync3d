import { SerialPort } from 'serialport';
import getStore from '../../store/store.js';

export default class StatusService {
  static async getSerialConnection(printerId: string): Promise<SerialPort> {
    if (getStore().connections[printerId]) {
      return getStore().connections[printerId];
    }

    const port = new SerialPort({
      path: printerId,
      baudRate: 115200,
      autoOpen: false
    });

    getStore().connections[printerId] = port;

    return new Promise((resolve, reject) => {
      port.open((error) => {
        if (error) {
          console.error(`Error opening port for ${printerId}:`, error.message);
          return reject(error);
        }

        return resolve(port);
      })
    });
  }
}