import { Request, Response, Router } from 'express';
import PrinterService from './service.js';
import { Printer } from '../../types/types.js';

const PrinterRouter = Router().get(
  '/printer',
  (request: Request, response: Response<Printer[]>): any =>
    response.send(PrinterService.getPrinters()),
);

export default PrinterRouter;
