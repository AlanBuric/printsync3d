import dotenv from 'dotenv';

export default class PrintSync3DConfig {
  static SERIAL_PORT_REFRESH_LIMIT_MILLISECONDS: number;
  static GCODE_UPLOAD_DIRECTORY: string;
  static BAUD_RATE: number;
  static PORT: number;

  constructor() {
    dotenv.config();

    PrintSync3DConfig.SERIAL_PORT_REFRESH_LIMIT_MILLISECONDS = PrintSync3DConfig.parseValidInt('SERIAL_PORT_REFRESH_LIMIT_MILLISECONDS');
    PrintSync3DConfig.GCODE_UPLOAD_DIRECTORY = PrintSync3DConfig.validateEnvVariable('GCODE_UPLOAD_DIRECTORY');
    PrintSync3DConfig.BAUD_RATE = PrintSync3DConfig.parseValidInt('BAUD_RATE');
    PrintSync3DConfig.PORT = PrintSync3DConfig.parseValidInt('PORT');
  }

  static validateEnvVariable(name: string): string {
    const value = process.env[name];

    if (value == null) {
      throw new Error(`Environment ${name} variable wasn't defined`);
    }

    return value;
  }

  static parseValidInt(name: string): number {
    const text = this.validateEnvVariable(name);
    const value = parseInt(text);

    if (!Number.isInteger(value)) {
      throw new Error(`Invalid integer ${name} with value ${text}`);
    }

    return value;
  }
}