import { Low } from "npm:lowdb@7.0.1";
import { JSONFilePreset } from "npm:lowdb@7.0.1/node";
import * as path from "jsr:@std/path";
import { StoredModel, StoredPrinter } from "../types/types.ts";

const DATABASE_FILE_LOCATION = "./database/database.json";

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
    throw new Error("Database already connected");
  }

  try {
    const directory = path.dirname(DATABASE_FILE_LOCATION);

    await Deno.mkdir(directory, { recursive: true });

    const data = new TextEncoder().encode(JSON.stringify(getDefaultData()));

    await Deno.writeFile(DATABASE_FILE_LOCATION, data);
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }

  database = await JSONFilePreset(DATABASE_FILE_LOCATION, getDefaultData());
}

export function getDatabase(): Low<DatabaseSchema> {
  if (!database) {
    throw new Error("Database isn't connected");
  }

  return database;
}
