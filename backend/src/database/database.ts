import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import fileSystem from 'fs';
import path from 'path';
import type { StoredModel, StoredPrinter } from '../types/types.js';
import EnvConfig from '../config/config.js';

type DatabaseSchema = {
  /**
   * Model file name as its ID to its custom display data
   */
  models: Record<string, StoredModel>;
  /**
   * Printer path as its ID to its custom display data
   */
  printers: Record<string, StoredPrinter>;
};

let database: Low<DatabaseSchema> | undefined = undefined;

function getDefaultData(): DatabaseSchema {
  return {
    models: {},
    printers: {},
  };
}

export async function connectDatabase() {
  if (database) {
    throw new Error('Database already connected');
  }

  const databaseFilePath = path.resolve(EnvConfig.DATA_DIRECTORY, 'database', 'database.json');

  await fileSystem.promises.access(databaseFilePath).catch(async () => {
    const directory = path.dirname(databaseFilePath);

    await fileSystem.promises.mkdir(directory, { recursive: true });
    await fileSystem.promises.writeFile(databaseFilePath, JSON.stringify(getDefaultData()));
  });

  database = await JSONFilePreset(databaseFilePath, getDefaultData());
}

export function getDatabase(): Low<DatabaseSchema> {
  if (!database) {
    throw new Error("Database isn't connected");
  }

  return database;
}
