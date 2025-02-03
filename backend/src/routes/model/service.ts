import * as path from "jsr:@std/path";
import { TextLineStream } from 'jsr:@std/streams'
import PrintSync3DConfig from "../../config/config.ts";
import getLoggingPrefix from "../../util/logging.ts";
import { getDatabase } from "../../database/database.ts";
import {
  ModelInformation,
  ModelsResponse,
} from "../../types/data-transfer-objects.ts";
import RequestError from "../../util/RequestError.ts";
import { StatusCodes } from "npm:http-status-codes@2.3.0";

// TODO: delete from getDatabase() files that are actually gone in the fileSystem
export default class ModelService {
  static MODEL_UPLOAD_DIRECTORY: string;

  constructor() {
    ModelService.MODEL_UPLOAD_DIRECTORY = path.resolve(
      PrintSync3DConfig.MODEL_UPLOAD_DIRECTORY,
    );

    try {
      Deno.mkdirSync(ModelService.MODEL_UPLOAD_DIRECTORY, { recursive: true });
      console.info(
        `${getLoggingPrefix()} Model directory didn't exist. Created one at ${ModelService.MODEL_UPLOAD_DIRECTORY}.`,
      );
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  }

  static async getAllModels(): Promise<ModelsResponse> {
    const models = getDatabase().data.models;
    const modelsResponse: ModelsResponse = structuredClone(models) as any;

    try {
      const directories: Deno.DirEntry[] = [];

      for await (const directory of Deno.readDir(this.MODEL_UPLOAD_DIRECTORY)) {
        directories.push(directory);
      }

      const tasks = directories.map(async (directory) => {
        const filePath = this.getModelPath(directory.name);
        const basename = this.extractBasename(directory.name);
        const stats = await Deno.stat(filePath);

        if (stats.isFile) {
          // In case new files were added externally, not via the API.
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
      });

      await Promise.allSettled(tasks);
    } catch (error) {
      console.error(
        `${getLoggingPrefix()} Error reading GCODE model file information:`,
        error,
      );
    }

    return modelsResponse;
  }

  static async getModel(modelId: string): Promise<ModelInformation> {
    const model = getDatabase().data.models[modelId];

    try {
      if (model) {
        return await Deno.stat(this.getModelPathFromModelId(modelId)).then(
          (stats) => this.mapFileStatsToInformation(stats, model.displayName),
        );
      }

      return await Deno.stat(this.getModelPathFromModelId(modelId))
        .then((stats) => this.mapFileStatsToInformation(stats, modelId))
        .then((modelInformation) => {
          getDatabase().update(
            ({ models }) => (models[modelId] = { displayName: modelId }),
          );
          return modelInformation;
        });
    } catch {
      throw new RequestError(
        StatusCodes.NOT_FOUND,
        `Model with ID ${modelId} was not found.`,
      );
    }
  }

  private static mapFileStatsToInformation(
    stats: Deno.FileInfo,
    displayName: string,
  ): ModelInformation {
    return {
      displayName: displayName,
      size: stats.size,
      creationTimestamp: (
        stats.birthtime ??
          stats.ctime ??
          stats.mtime ??
          new Date()
      )?.getTime(),
    };
  }

  static registerNewFileAndGetName(file: Express.Multer.File): string {
    const filename = this.createFileName();

    getDatabase().data.models[this.extractBasename(filename)] = {
      displayName: file.originalname,
    };

    return filename;
  }

  static editModel(modelId: string, displayName: string) {
    const model = getDatabase().data.models[modelId];

    if (model) {
      model.displayName = displayName;
      return getDatabase().write();
    }

    throw new RequestError(
      StatusCodes.NOT_FOUND,
      `Model with ID ${modelId} was not found.`,
    );
  }

  static async deleteModel(modelId: string) {
    await Promise.all([
      Deno.remove(this.getModelPathFromModelId(modelId)),
      getDatabase().update(({ models }) => delete models[modelId]),
    ]);

    console.info(`${getLoggingPrefix()} Deleted model ${modelId}.gcode.`);
  }

  static async getModelFileStream(modelId: string) {
    const modelPath = path.join(this.MODEL_UPLOAD_DIRECTORY, this.createFileName(modelId));
    const file = await Deno.open(modelPath, {read: true});
    return file
      .readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
  }

  static createFileName(modelId?: string): string {
    return `${modelId ?? crypto.randomUUID()}.gcode`;
  }

  static getModelPathFromModelId(modelId: string): string {
    return this.getModelPath(this.createFileName(modelId));
  }

  static getModelPath(filename: string): string {
    return path.join(this.MODEL_UPLOAD_DIRECTORY, filename);
  }

  static extractBasename(filename: string) {
    return filename.split(".")[0];
  }
}
