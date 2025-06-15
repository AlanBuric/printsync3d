import { randomUUID } from 'crypto';
import fileSystem from 'fs';
import { createInterface } from 'readline';
import EnvConfig from '../../config/config.js';
import path from 'path';
import getLoggingPrefix from '../../util/logging.js';
import { getDatabase } from '../../database/database.js';
import type { Model } from '../../types/data-transfer-objects.js';
import RequestError from '../../util/RequestError.js';
import { StatusCodes } from 'http-status-codes';

export default class ModelService {
  static MODEL_DIRECTORY: string;

  private constructor() {}

  static initialize() {
    ModelService.MODEL_DIRECTORY = path.resolve(EnvConfig.DATA_DIRECTORY, 'models');

    if (fileSystem.existsSync(ModelService.MODEL_DIRECTORY)) {
      ModelService.syncModelsWithFileSystem();
    } else {
      ModelService.createModelDirectory();
    }
  }

  private static async createModelDirectory() {
    console.info(
      `${getLoggingPrefix()} Model directory doesn't exist. Creating one at ${ModelService.MODEL_DIRECTORY}.`,
    );
    fileSystem.mkdirSync(ModelService.MODEL_DIRECTORY, { recursive: true });
  }

  private static async syncModelsWithFileSystem() {
    fileSystem.promises.readdir(ModelService.MODEL_DIRECTORY).then((files) => {
      const allNames = new Set(Object.keys(getDatabase().data.models));

      files.forEach((file) => {
        const modelId = ModelService.extractBasename(file);

        if (!allNames.delete(modelId)) {
          getDatabase().data.models[modelId] = { displayName: modelId };
        }
      });

      allNames.forEach((modelId) => delete getDatabase().data.models[modelId]);
      getDatabase().write();
    });
  }

  /**
   * Retrieves all models from the database and merges them their file information.
   * @returns A promise that resolves to an object containing all models and their information.
   */
  static async getAllModels(): Promise<Model[]> {
    const models = getDatabase().data.models;
    const fullModels: Model[] = [];

    try {
      const files = await fileSystem.promises.readdir(this.MODEL_DIRECTORY);

      await Promise.allSettled(
        files.map(async (filename) => {
          const filePath = this.getModelPath(filename);
          const modelId = this.extractBasename(filename);
          const stats = await fileSystem.promises.stat(filePath);

          if (stats.isFile()) {
            /*
             * In case new files were somehow added manually.
             */
            if (!models[modelId]) {
              models[modelId] = {
                displayName: modelId,
              };
            }

            fullModels.push(
              this.mapFileStatsToModel(stats, models[modelId].displayName ?? modelId, modelId),
            );
          }
        }),
      );
    } catch (error) {
      console.error(`${getLoggingPrefix()} Error reading GCODE model file information:`, error);
    }

    return fullModels;
  }

  /**
   * Retrieves a model from the database and merges it with its file information.
   * @returns A promise that resolves to an object containing the model.
   */
  static async getModel(modelId: string): Promise<Model> {
    const model = getDatabase().data.models[modelId];

    try {
      if (!model) {
        return await fileSystem.promises
          .stat(this.getModelPathFromModelId(modelId))
          .then((stats) => this.mapFileStatsToModel(stats, modelId, modelId))
          .then((modelInformation) => {
            getDatabase().update(({ models }) => (models[modelId] = { displayName: modelId }));

            return modelInformation;
          });
      }

      return await fileSystem.promises
        .stat(this.getModelPathFromModelId(modelId))
        .then((stats) => this.mapFileStatsToModel(stats, model.displayName, modelId));
    } catch {
      throw new RequestError(StatusCodes.NOT_FOUND, `Model with ID ${modelId} was not found.`);
    }
  }

  private static mapFileStatsToModel(
    stats: fileSystem.Stats,
    displayName: string,
    modelId: string,
  ): Model {
    return {
      modelId,
      displayName: displayName,
      size: stats.size,
      creationTimestamp: stats.birthtimeMs ?? stats.ctimeMs,
    };
  }

  static registerNewFileAndGetName(file: Express.Multer.File): string {
    const filename = this.createFileName();

    getDatabase().data.models[this.extractBasename(filename)] = {
      displayName: file.originalname.split('.')[0] ?? file.originalname,
    };

    return filename;
  }

  static async editModel(modelId: string, displayName: string) {
    const model = getDatabase().data.models[modelId];

    if (model) {
      model.displayName = displayName;
      return getDatabase().write();
    }

    try {
      await fileSystem.promises.access(
        this.getModelPathFromModelId(modelId),
        fileSystem.constants.R_OK,
      );

      getDatabase().data.models[modelId] = { displayName };

      return getDatabase().write();
    } catch {
      throw new RequestError(StatusCodes.NOT_FOUND, `Model with ID ${modelId} was not found.`);
    }
  }

  static async deleteModel(modelId: string) {
    await Promise.all([
      fileSystem.promises.rm(this.getModelPathFromModelId(modelId)),
      getDatabase().update(({ models }) => delete models[modelId]),
    ]);

    console.info(`${getLoggingPrefix()} Deleted model ${modelId}.gcode.`);
  }

  static getModelFileStream(modelId: string) {
    return createInterface({
      input: fileSystem.createReadStream(this.getModelPath(modelId)),
      crlfDelay: Infinity,
    });
  }

  static createFileName(modelId?: string) {
    return `${modelId ?? randomUUID()}.gcode`;
  }

  static getModelPathFromModelId(modelId: string) {
    return this.getModelPath(this.createFileName(modelId));
  }

  static getModelPath(filename: string): fileSystem.PathLike {
    return path.join(this.MODEL_DIRECTORY, filename);
  }

  static extractBasename(filename: string) {
    return filename.split('.')[0];
  }
}
