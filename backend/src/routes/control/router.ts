import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import processValidation from '../../middleware/process-validation.js';
import { body, matchedData, param } from 'express-validator';
import knownControls, { PRINTER_CONTROL_TYPES } from '../../gcode/known-controls.js';
import PrinterService from '../printer/service.js';

const ControlRouter = Router()
  .get('/control', (_request: Request, response: Response): any =>
    response.send(Object.keys(knownControls)),
  )
  .post(
    '/control/:printerId',
    param('printerId')
      .exists()
      .withMessage('Printer ID is a required string')
      .isString()
      .withMessage('Printer ID needs to be a string'),
    body('controlType')
      .exists()
      .withMessage('Control type is a required string')
      .isIn(PRINTER_CONTROL_TYPES)
      .withMessage(
        `Control type needs to be one of the following strings: ${PRINTER_CONTROL_TYPES.join(', ')}`,
      ),
    processValidation,
    async (request: Request, response: Response): Promise<any> => {
      const { printerId, controlType } = matchedData(request);

      PrinterService.sendGCode(printerId, controlType);

      response.sendStatus(StatusCodes.OK);
    },
  );

export default ControlRouter;
