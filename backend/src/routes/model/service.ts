import { randomUUID } from 'crypto';
import fileSystem from 'fs';
import { createInterface } from 'readline';
import PrintSync3DConfig from '../../config/config.js';
import path from 'path';
import getLoggingPrefix from '../../util/logging.js';
import { getDatabase } from '../../database/database.js';
import { ModelInformation, ModelsResponse } from '../../types/data-transfer-objects.js';
import RequestError from '../../util/RequestError.js';
import { StatusCodes } from 'http-status-codes';

// TODO: delete from getDatabase() files that are actually gone in the fileSystem
export default class ModelService {
  static GCODE_UPLOAD_DIRECTORY: string;

  constructor() {
    ModelService.GCODE_UPLOAD_DIRECTORY = path.resolve(PrintSync3DConfig.GCODE_UPLOAD_DIRECTORY);

    if (!fileSystem.existsSync(ModelService.GCODE_UPLOAD_DIRECTORY)) {
      console.info(
        `${getLoggingPrefix()} GCODE directory doesn't exist. Creating one at ${ModelService.GCODE_UPLOAD_DIRECTORY}.`,
      );
      fileSystem.mkdirSync(ModelService.GCODE_UPLOAD_DIRECTORY, { recursive: true });
    }
  }

  static async getAllModels(): Promise<ModelsResponse> {
    const models = getDatabase().data.models;
    const modelsResponse: ModelsResponse = structuredClone(models);

    try {
      const files = await fileSystem.promises.readdir(this.GCODE_UPLOAD_DIRECTORY);

      await Promise.allSettled(
        files.map(async (filename) => {
          const filePath = this.getModelPath(filename);
          const basename = this.extractBasename(filename);
          const stats = await fileSystem.promises.stat(filePath);

          if (stats.isFile()) {
            /*
             * In case new files were added.
             */
            if (!models[basename]) {
              models[basename] = {
                displayName: basename,
              };
            }

            modelsResponse[basename] = this.mapFileStatsToInformation(
              stats,
              models[basename].displayName ?? basename,
            );
          }
        }),
      );
    } catch (error) {
      console.error(`${getLoggingPrefix()} Error reading GCODE model file information:`, error);
    }

    return modelsResponse;
  }

  static async getModel(modelId: string): Promise<ModelInformation> {
    const model = getDatabase().data.models[modelId];

    try {
      if (!model) {
        return await fileSystem.promises
          .stat(this.getModelPathFromModelId(modelId))
          .then((stats) => this.mapFileStatsToInformation(stats, modelId))
          .then((modelInformation) => {
            getDatabase().update(({ models }) => (models[modelId] = { displayName: modelId }));
            return modelInformation;
          });
      }

      return await fileSystem.promises
        .stat(this.getModelPathFromModelId(modelId))
        .then((stats) => this.mapFileStatsToInformation(stats, model.displayName));
    } catch {
      throw new RequestError(StatusCodes.NOT_FOUND, `Model with ID ${modelId} was not found.`);
    }
  }

  private static mapFileStatsToInformation(
    stats: fileSystem.Stats,
    displayName: string,
  ): ModelInformation {
    return {
      displayName: displayName,
      size: stats.size,
      creationTimestamp: stats.birthtimeMs ?? stats.ctimeMs,
    };
  }

  static registerNewFileAndGetName(file: Express.Multer.File): string {
    const filename = this.createFileName();

    getDatabase().data.models[this.extractBasename(filename)] = { displayName: file.originalname };

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

  static deleteModel(modelId: string) {
    return Promise.all([
      fileSystem.promises.rm(this.getModelPathFromModelId(modelId)),
      getDatabase().update(({ models }) => delete models[modelId]),
    ]);
  }

  static getModelFileStream(modelId: string) {
    return createInterface({
      input: fileSystem.createReadStream(
        path.resolve(path.join(this.GCODE_UPLOAD_DIRECTORY, this.createFileName(modelId))),
      ),
      crlfDelay: Infinity,
    });
  }

  static createFileName(modelId?: string): string {
    return `${modelId ?? randomUUID()}.gcode`;
  }

  static getModelPathFromModelId(modelId: string): fileSystem.PathLike {
    return this.getModelPath(this.createFileName(modelId));
  }

  static getModelPath(filename: string): fileSystem.PathLike {
    return path.join(this.GCODE_UPLOAD_DIRECTORY, filename);
  }

  static extractBasename(filename: string) {
    return filename.split('.')[0];
  }
}
