import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import fileSystem from 'fs';
import path from 'path';
import { StoredPrinter } from '../types/types.js';

const DATABASE_FILE_LOCATION = './database/database.json';

type DatabaseSchema = {
  models: Record<string, string>
  printers: Record<string, StoredPrinter>
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

  await fileSystem.promises.access(DATABASE_FILE_LOCATION).catch(async () => {
    const directory = path.dirname(DATABASE_FILE_LOCATION);

    await fileSystem.promises.mkdir(directory, { recursive: true });
    await fileSystem.promises.writeFile(DATABASE_FILE_LOCATION, JSON.stringify(getDefaultData()));
  });

  database = await JSONFilePreset(DATABASE_FILE_LOCATION, getDefaultData());
}

export function getDatabase(): Low<DatabaseSchema> {
  if (!database) {
    throw new Error("Database isn't connected");
  }

  return database;
}
