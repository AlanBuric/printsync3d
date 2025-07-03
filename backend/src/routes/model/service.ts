import { randomUUID } from 'crypto';
import fileSystem from 'fs';
import { createInterface } from 'readline';
import EnvConfig from '../../config/config.js';
import path from 'path';
import getLoggingPrefix from '../../util/logging.js';
import { getDatabase } from '../../database/database.js';
import type { ModelResponse } from '../../types/data-transfer-objects.js';
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
  static async getAllModels(): Promise<ModelResponse[]> {
    const models = getDatabase().data.models;
    const fullModels: ModelResponse[] = [];

    try {
      const files = await fileSystem.promises.readdir(ModelService.MODEL_DIRECTORY);

      await Promise.allSettled(
        files.map(async (filename) => {
          const filePath = ModelService.getModelPath(filename);
          const modelId = ModelService.extractBasename(filename);
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
              ModelService.mapFileStatsToModel(
                stats,
                models[modelId].displayName ?? modelId,
                modelId,
              ),
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
  static async getModel(modelId: string): Promise<ModelResponse> {
    const model = getDatabase().data.models[modelId];

    try {
      if (!model) {
        return await fileSystem.promises
          .stat(ModelService.getModelPathFromModelId(modelId))
          .then((stats) => ModelService.mapFileStatsToModel(stats, modelId, modelId))
          .then((modelInformation) => {
            getDatabase().update(({ models }) => (models[modelId] = { displayName: modelId }));

            return modelInformation;
          });
      }

      return await fileSystem.promises
        .stat(ModelService.getModelPathFromModelId(modelId))
        .then((stats) => ModelService.mapFileStatsToModel(stats, model.displayName, modelId));
    } catch {
      throw new RequestError(StatusCodes.NOT_FOUND, `Model with ID ${modelId} was not found.`);
    }
  }

  private static mapFileStatsToModel(
    stats: fileSystem.Stats,
    displayName: string,
    modelId: string,
  ): ModelResponse {
    return {
      modelId,
      displayName: displayName,
      size: stats.size,
      creationTimestamp: stats.birthtimeMs ?? stats.ctimeMs,
    };
  }

  static registerNewFileAndGetName(file: Express.Multer.File): string {
    const filename = ModelService.createFileName();

    getDatabase().data.models[ModelService.extractBasename(filename)] = {
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
        ModelService.getModelPathFromModelId(modelId),
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
      fileSystem.promises.rm(ModelService.getModelPathFromModelId(modelId)),
      getDatabase().update(({ models }) => delete models[modelId]),
    ]);

    console.info(`${getLoggingPrefix()} Deleted model ${modelId}.gcode.`);
  }

  static getModelFileStream(modelId: string) {
    return createInterface({
      input: fileSystem.createReadStream(ModelService.getModelPath(modelId)),
      crlfDelay: Infinity,
    });
  }

  static createFileName(modelId?: string) {
    return `${modelId ?? randomUUID()}.gcode`;
  }

  static getModelPathFromModelId(modelId: string) {
    return ModelService.getModelPath(ModelService.createFileName(modelId));
  }

  static getModelPath(filename: string): fileSystem.PathLike {
    return path.join(ModelService.MODEL_DIRECTORY, filename);
  }

  static extractBasename(filename: string) {
    return filename.split('.')[0];
  }
}
