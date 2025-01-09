import { Request, Response, Router } from 'express';
import PrinterService from './service.js';
import { Printer } from '../../types/types.js';
import { matchedData, query } from 'express-validator';

const PrinterRouter = Router().get(
  '/printer',
  query('refresh').optional().toBoolean(),
  async (request: Request, response: Response<Printer[]>): Promise<any> => {
    if (matchedData(request).refresh) {
      await PrinterService.refreshConnections();
    }

    response.send(PrinterService.getPrinters());
  },
);

export default PrinterRouter;
