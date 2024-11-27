import StatusService from '../status/service.js';

export default class GCodeService {
  static sendGCode(printerId: string, gCode: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const connection = StatusService.getSerialConnection(printerId);

      connection.write(`${gCode}\n`, (err) => {
        if (err) {
          return reject(`Failed to send GCode to ${printerId}: ${err.message}`);
        }

        resolve(`Sent: ${gCode}`);
      });
    });
  }
}