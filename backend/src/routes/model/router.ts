import { type Request, type Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import ModelService from './service.js';
import type { ModelInformation, ModelsResponse } from '../../types/data-transfer-objects.js';
import { body, matchedData, param } from 'express-validator';
import handleValidationResults from '../../middleware/validation-handler.js';
import { getDatabase } from '../../database/database.js';
import getLoggingPrefix from '../../util/logging.js';
import path from 'path';
import PrintSync3DConfig from '../../config/config.js';
import type { MinMaxOptions } from 'express-validator/lib/options.js';

export const MODEL_ID_VALIDATOR = param('modelId').notEmpty().withMessage('Model ID is required');
const MAX_FILE_UPLOAD_COUNT = 20;
const MAX_FILE_SIZE = 1.5e9;
const FILE_NAME_LIMITS: MinMaxOptions = { min: 1, max: 60 };

function createMulterHandler() {
  const storage = multer.diskStorage({
    destination: ModelService.MODEL_UPLOAD_DIRECTORY,
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
      (_request: Request, response: Response<ModelsResponse>): Promise<any> =>
        ModelService.getAllModels().then((models) => response.send(models)),
    )
    .get(
      '/:modelId',
      MODEL_ID_VALIDATOR,
      handleValidationResults,
      async (request: Request, response: Response<ModelInformation>): Promise<any> => {
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
          path.resolve(PrintSync3DConfig.MODEL_UPLOAD_DIRECTORY, `${modelId}.gcode`),
          `${foundModel.displayName}.gcode`,
        );
      },
    )
    .patch(
      '/:modelId',
      MODEL_ID_VALIDATOR,
      body('displayName')
        .notEmpty()
        .withMessage('Display name is required')
        .isLength(FILE_NAME_LIMITS)
        .withMessage(
          `Model display name needs to be between ${FILE_NAME_LIMITS.min} and ${FILE_NAME_LIMITS.max} characters long`,
        ),
      handleValidationResults,
      (request: Request, response: Response) => {
        const { modelId, displayName } = matchedData(request);

        ModelService.editModel(modelId, displayName).then(() =>
          response.sendStatus(StatusCodes.OK),
        );
      },
    )
    .delete('/:modelId', MODEL_ID_VALIDATOR, (request: Request, response: Response) => {
      const { modelId } = matchedData(request);
      ModelService.deleteModel(modelId).then(() => response.sendStatus(StatusCodes.OK));
    })
    .post('', createMulterHandler(), async (request: Request, response: Response): Promise<any> => {
      if (!request.files || !Object.keys(request.files).length) {
        return response.status(StatusCodes.BAD_REQUEST).send('No files uploaded');
      }

      await getDatabase().write();
      console.info(`${getLoggingPrefix()} Uploaded ${request.files.length} models.`);

      response.sendStatus(StatusCodes.CREATED);
    });
}

export default ModelRouter;
