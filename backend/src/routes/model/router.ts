import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import ModelService from './service.js';
import { ModelInformation, ModelsResponse } from '../../types/data-transfer-objects.js';
import { body, matchedData, param } from 'express-validator';
import handleValidationResults from '../../middleware/validation-handler.js';
import { getDatabase } from '../../database/database.js';
import getLoggingPrefix from '../../util/logging.js';

export const MODEL_ID_VALIDATOR = param('modelId').notEmpty().withMessage('Model ID is required');

const ModelRouter = () => {
  const storage = multer.diskStorage({
    destination: ModelService.GCODE_UPLOAD_DIRECTORY,
    filename: (_request, file, callback) => {
      callback(null, ModelService.registerNewFileAndGetName(file));
    },
  });

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
    .patch(
      '/:modelId',
      MODEL_ID_VALIDATOR,
      body('displayName').notEmpty().withMessage('Display name is required'),
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
    .post(
      '',
      multer({ storage }).array('files'),
      async (request: Request, response: Response): Promise<any> => {
        if (!request.files || !Object.keys(request.files).length) {
          return response.status(StatusCodes.BAD_REQUEST).send('No files uploaded');
        }

        await getDatabase().write();
        console.info(`${getLoggingPrefix()} Uploaded ${request.files.length} models.`);

        response.sendStatus(StatusCodes.CREATED);
      },
    );
};

export default ModelRouter;
