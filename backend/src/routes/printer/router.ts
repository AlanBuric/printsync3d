import { Request, Response, Router } from 'express';
import PrinterService from './service.js';
import { Printer } from '../../types/types.js';
import { body, matchedData, param } from 'express-validator';
import handleValidationResults from '../../middleware/validation-handler.js';
import { StatusCodes } from 'http-status-codes';
import PRINTER_CONTROLS, { PRINTER_CONTROL_TYPES } from './known-controls.js';
import ModelService from '../model/service.js';
import { ErrorResponse } from '../../types/data-transfer-objects.js';
import { MinMaxOptions } from 'express-validator/lib/options.js';
import { getDatabase } from '../../database/database.js';

const printerIdValidator = param('printerId')
  .notEmpty()
  .withMessage('Printer ID is a required string')
  .isString()
  .withMessage('Printer ID needs to be a string');
const printerDisplayNameMinMax: MinMaxOptions = { min: 1, max: 50 };

const PrinterRouter = Router()
  .get('', (_request: Request, response: Response<Printer[]>): any =>
    response.send(PrinterService.getPrinters()),
  )
  .post('/refresh', async (_request: Request, response: Response): Promise<any> => {
    await PrinterService.refreshConnections();
    response.send(PrinterService.getPrinters());
  })
  .get(
    '/:printerId',
    printerIdValidator,
    handleValidationResults,
    (request: Request, response: Response<Printer>): any =>
      response.send(PrinterService.getPrinter(matchedData(request).printerId)),
  )
  .patch(
    '/:printerId',
    printerIdValidator,
    body('displayName')
      .trim()
      .notEmpty()
      .withMessage('Display name is required')
      .bail()
      .isLength(printerDisplayNameMinMax)
      .withMessage(
        `Printer display name must be between ${printerDisplayNameMinMax.min} and ${printerDisplayNameMinMax.max} characters long`,
      )
      .escape(),
    handleValidationResults,
    (request: Request, response: Response<ErrorResponse>): any => {
      const { printerId, displayName } = matchedData(request);
      const printer = getDatabase().data.printers[printerId];

      if (!printer) {
        return response.sendStatus(StatusCodes.NOT_FOUND);
      }

      printer.displayName = displayName;
    },
  )
  .delete('/:printerId', printerIdValidator, (request: Request, response: Response) => {
    const { printerId } = matchedData(request);
    PrinterService.removePrinter(printerId);
    response.sendStatus(StatusCodes.OK);
  })
  .get(
    '/:printerId/status',
    printerIdValidator,
    handleValidationResults,
    (request: Request, response: Response) => {
      const { printerId } = matchedData(request);
      PrinterService.handleStatus(PrinterService.getConnectedPrinter(printerId), response);
    },
  )
  .get('/control', (_request: Request, response: Response): any =>
    response.send(Object.keys(PRINTER_CONTROLS)),
  )
  .post(
    '/:printerId/control',
    printerIdValidator,
    body('controlType')
      .notEmpty()
      .withMessage('Control type is a required string')
      .isIn(PRINTER_CONTROL_TYPES)
      .withMessage(
        `Control type needs to be one of the following strings: ${PRINTER_CONTROL_TYPES.join(', ')}`,
      ),
    handleValidationResults,
    async (request: Request, response: Response): Promise<any> => {
      const { printerId, controlType } = matchedData(request);

      PrinterService.sendGCode(printerId, controlType);

      response.sendStatus(StatusCodes.OK);
    },
  )
  .post('/:printId/print/:modelId', (request: Request, response: Response) => {
    const { printerId, modelId } = matchedData(request);

    PrinterService.printGCodeModel(
      PrinterService.getConnectedPrinter(printerId),
      ModelService.getModelFileStream(modelId),
      modelId,
    );

    response.sendStatus(StatusCodes.OK);
  });

export default PrinterRouter;
