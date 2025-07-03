import dotenv from 'dotenv';

export default class EnvConfig {
  static DATA_DIRECTORY: string;
  static BAUD_RATE: number;
  static PORT: number;

  private constructor() {}

  static initialize() {
    dotenv.config();

    EnvConfig.DATA_DIRECTORY = EnvConfig.validateEnvVariable('DATA_DIRECTORY');
    EnvConfig.BAUD_RATE = EnvConfig.parseValidInt('BAUD_RATE');
    EnvConfig.PORT = EnvConfig.parseValidInt('PORT');
  }

  static validateEnvVariable(name: string): string {
    const value = process.env[name];

    if (value == null) {
      throw new Error(`Environment ${name} variable wasn't defined`);
    }

    return value;
  }

  static parseValidInt(name: string): number {
    const text = EnvConfig.validateEnvVariable(name);
    const value = parseInt(text);

    if (!Number.isInteger(value)) {
      throw new Error(`Invalid integer ${name} with value ${text}`);
    }

    return value;
  }
}
