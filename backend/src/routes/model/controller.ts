import type { Request, Response } from 'express';
import type { ModelResponse } from '../../types/data-transfer-objects.js';
import ModelService from './service.js';
import { matchedData } from 'express-validator';
import { getDatabase } from '../../database/database.js';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { sseChannel } from '../server-side-events.js';
import getLoggingPrefix from '../../util/logging.js';

type ModelRequest = { modelId: string };
type ModelEditRequest = { modelId: string; displayName: string };

export default class ModelController {
  static async getAllModels(_request: Request, response: Response<ModelResponse[]>) {
    response.send(await ModelService.getAllModels());
  }

  static async getModel(request: Request, response: Response<ModelResponse>) {
    const { modelId } = matchedData<ModelRequest>(request);

    response.send(await ModelService.getModel(modelId));
  }

  static async uploadModel(request: Request, response: Response<string | undefined>): Promise<any> {
    if (!request.files || !Object.keys(request.files).length) {
      return response.status(StatusCodes.BAD_REQUEST).send('No files uploaded');
    }

    await getDatabase().write();
    console.info(`${getLoggingPrefix()} Uploaded ${request.files.length} models.`);

    response.sendStatus(StatusCodes.CREATED);
    sseChannel.broadcast(await ModelService.getAllModels(), 'updateModels');
  }

  static async downloadModel(
    request: Request,
    response: Response<string | undefined>,
  ): Promise<any> {
    const { modelId } = matchedData<ModelRequest>(request);
    const foundModel = getDatabase().data.models[modelId];

    if (!foundModel) {
      return response.status(StatusCodes.NOT_FOUND).send("Model file doesn't exist");
    }

    response.download(
      path.resolve(ModelService.MODEL_DIRECTORY, `${modelId}.gcode`),
      `${foundModel.displayName}.gcode`,
    );
  }

  static async editModel(request: Request, response: Response) {
    const { modelId, displayName } = matchedData<ModelEditRequest>(request);

    try {
      await ModelService.editModel(modelId, displayName);
      response.sendStatus(StatusCodes.OK);
      sseChannel.broadcast({ displayName, modelId }, 'updateModel');
    } catch (error) {
      console.error(`${getLoggingPrefix()} Failed to edit model ${modelId}:`, error);
      response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async deleteModel(request: Request, response: Response) {
    const { modelId } = matchedData<ModelRequest>(request);

    try {
      await ModelService.deleteModel(modelId);
      response.sendStatus(StatusCodes.OK);
      sseChannel.broadcast(modelId, 'deleteModel');
    } catch (error) {
      console.error(`${getLoggingPrefix()} Error occurred while trying to delete a file`, error);
      response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("File is already in use or doesn't exist");
    }
  }
}
