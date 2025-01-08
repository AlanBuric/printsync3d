import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import StatusService from './service.js';
import { ReadlineParser } from '@serialport/parser-readline';
import PrinterService from '../printer/service.js';
import processValidation from '../../middleware/process-validation.js';
import { matchedData, param } from 'express-validator';

const StatusRouter = Router()
  .get('/status/:printerId',
    param('printerId')
      .exists()
      .withMessage('Printer ID is a required string'),
    processValidation,
    async (request: Request, response: Response): Promise<any> => {
      const { printerId } = matchedData(request);

      if (!PrinterService.getConnection(printerId)) {
        return response.sendStatus(StatusCodes.NOT_FOUND);
      }

      const serialPort = await StatusService.getSerialConnection(printerId).catch(error => {
        PrinterService.closeConnection(printerId);
        throw error;
      });
      const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

      parser.once('data', (status: string) => {
        response.json({ printerId, status });
        parser.removeAllListeners();
      });

      serialPort.write('M27\nM105\n');
      serialPort.flush();
    });

export default StatusRouter;