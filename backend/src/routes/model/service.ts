import { randomUUID } from 'crypto';
import fileSystem from 'fs';
import { createInterface } from 'readline';
import PrintSync3DConfig from '../../config/config.js';
import path from 'path';

export default class ModelService {
  static createFilename(): string {
    return `${randomUUID()}.gcode`;
  }

  static getFileStream(fileId: string) {
    return createInterface({
      input: fileSystem.createReadStream(
        path.resolve(path.join(PrintSync3DConfig.GCODE_UPLOAD_DIRECTORY, fileId + '.gcode')),
      ),
      crlfDelay: Infinity,
    });
  }
}
