import { Router } from 'express';
import multer from 'multer';
import ModelService from './service.js';
import { body, param } from 'express-validator';
import handleValidationResults from '../../middleware/validation-handler.js';
import type { MinMaxOptions } from 'express-validator/lib/options.js';
import ModelController from './controller.js';

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
    .get('', ModelController.getAllModels)
    .get('/:modelId', MODEL_ID_VALIDATOR, handleValidationResults, ModelController.getModel)
    .get(
      '/:modelId/download',
      MODEL_ID_VALIDATOR,
      handleValidationResults,
      ModelController.downloadModel,
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
      ModelController.editModel,
    )
    .delete('/:modelId', MODEL_ID_VALIDATOR, ModelController.deleteModel)
    .post('', createMulterHandler(), ModelController.uploadModel);
}

export default ModelRouter;
