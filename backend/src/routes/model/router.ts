import { type Request, type Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import ModelService from './service.js';
import type { Model } from '../../types/data-transfer-objects.js';
import { body, matchedData, param } from 'express-validator';
import handleValidationResults from '../../middleware/validation-handler.js';
import { getDatabase } from '../../database/database.js';
import getLoggingPrefix from '../../util/logging.js';
import path from 'path';
import type { MinMaxOptions } from 'express-validator/lib/options.js';
import { sseChannel } from '../server-side-events.js';

export const MODEL_ID_VALIDATOR = param('modelId').notEmpty().withMessage('Model ID is required');

const MAX_FILE_UPLOAD_COUNT = 20;
const MAX_FILE_SIZE = 1.5e9;
const FILE_NAME_LIMITS: MinMaxOptions = { min: 1, max: 60 };

function createMulterHandler() {
  const storage = multer.diskStorage({
    destination: ModelService.MODEL_DIRECTORY,
    filename: (_request, file, callback) => {
      callback(null, ModelService.registerNewFileAndGetName(file));
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: MAX_FILE_UPLOAD_COUNT,
    },
  }).array('files', MAX_FILE_UPLOAD_COUNT);
}

function ModelRouter() {
  return Router()
    .get(
      '',
      (_request: Request, response: Response<Model[]>): Promise<any> =>
        ModelService.getAllModels().then((models) => response.send(models)),
    )
    .get(
      '/:modelId',
      MODEL_ID_VALIDATOR,
      handleValidationResults,
      async (request: Request, response: Response<Model>): Promise<any> => {
        const { modelId } = matchedData(request);
        return response.send(await ModelService.getModel(modelId));
      },
    )
    .get(
      '/:modelId/download',
      MODEL_ID_VALIDATOR,
      handleValidationResults,
      async (request: Request, response: Response): Promise<any> => {
        const { modelId } = matchedData(request);
        const foundModel = getDatabase().data.models[modelId];

        if (!foundModel) {
          return response.status(StatusCodes.NOT_FOUND).send("Model file doesn't exist");
        }

        response.download(
          path.resolve(ModelService.MODEL_DIRECTORY, `${modelId}.gcode`),
          `${foundModel.displayName}.gcode`,
        );
      },
    )
    .patch(
      '/:modelId',
      MODEL_ID_VALIDATOR,
      body('displayName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Display name can't be blank")
        .isLength(FILE_NAME_LIMITS)
        .withMessage(
          `Model display name needs to be between ${FILE_NAME_LIMITS.min} and ${FILE_NAME_LIMITS.max} characters long`,
        ),
      handleValidationResults,
      (request: Request, response: Response) => {
        const { modelId, displayName } = matchedData(request);

        ModelService.editModel(modelId, displayName)
          .then(async () => {
            response.sendStatus(StatusCodes.OK);
            sseChannel.broadcast({ displayName, modelId }, 'updateModel');
          })
          .catch((error) => {
            console.error(`${getLoggingPrefix()} Failed to edit model ${modelId}:`, error);
            response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
          });
      },
    )
    .delete('/:modelId', MODEL_ID_VALIDATOR, (request: Request, response: Response) => {
      const { modelId } = matchedData(request);
      ModelService.deleteModel(modelId).then(() => {
        response.sendStatus(StatusCodes.OK);
        sseChannel.broadcast(modelId, 'deleteModel');
      });
    })
    .post('', createMulterHandler(), async (request: Request, response: Response): Promise<any> => {
      if (!request.files || !Object.keys(request.files).length) {
        return response.status(StatusCodes.BAD_REQUEST).send('No files uploaded');
      }

      await getDatabase().write();
      console.info(`${getLoggingPrefix()} Uploaded ${request.files.length} models.`);

      response.sendStatus(StatusCodes.CREATED);
      sseChannel.broadcast(await ModelService.getAllModels(), 'updateModels');
    });
}

export default ModelRouter;
