import { Router } from 'express';
import { body, param } from 'express-validator';
import handleValidationResults from '../../middleware/validation-handler.js';
import { PRINTER_CONTROL_TYPES } from '../../types/controls.js';
import type { MinMaxOptions } from 'express-validator/lib/options.js';
import PrinterController from './controller.js';
import { MODEL_ID_VALIDATOR } from '../model/router.js';

const PRINTER_ID_VALIDATOR = param('printerId')
  .notEmpty()
  .withMessage('Printer ID is a required string')
  .isString()
  .withMessage('Printer ID needs to be a string');

const PRINTER_DISPLAY_NAME_LIMITS: MinMaxOptions = { min: 1, max: 50 };

const PrinterRouter = Router()
  .get('', PrinterController.getAllPrinters)
  .post('/refresh', PrinterController.refreshAndGetAllPrinters)
  .get('/:printerId', PRINTER_ID_VALIDATOR, handleValidationResults, PrinterController.getPrinter)
  .patch(
    '/:printerId',
    PRINTER_ID_VALIDATOR,
    body('displayName')
      .trim()
      .notEmpty()
      .withMessage('Display name is required')
      .bail()
      .isLength(PRINTER_DISPLAY_NAME_LIMITS)
      .withMessage(
        `Printer display name must be between ${PRINTER_DISPLAY_NAME_LIMITS.min} and ${PRINTER_DISPLAY_NAME_LIMITS.max} characters long`,
      )
      .escape(),
    handleValidationResults,
    PrinterController.editPrinter,
  )
  .delete('/:printerId', PRINTER_ID_VALIDATOR, PrinterController.disconnectPrinter)
  .get('/control', PrinterController.getControlTypes)
  .post(
    '/:printerId/control',
    PRINTER_ID_VALIDATOR,
    body('controlType')
      .notEmpty()
      .withMessage('Control type is a required string')
      .isIn(PRINTER_CONTROL_TYPES)
      .withMessage(
        `Control type needs to be one of the following strings: ${PRINTER_CONTROL_TYPES.join(', ')}`,
      ),
    handleValidationResults,
    PrinterController.controlPrinter,
  )
  .post(
    '/:printerId/print/:modelId',
    PRINTER_ID_VALIDATOR,
    MODEL_ID_VALIDATOR,
    handleValidationResults,
    PrinterController.printModel,
  );

export default PrinterRouter;
