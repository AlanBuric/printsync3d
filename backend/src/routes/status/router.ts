import { Request, Response, Router } from 'express';
import getStore from '../../store/store.js';
import { StatusCodes } from 'http-status-codes';
import StatusService from './service.js';
import { ReadlineParser } from '@serialport/parser-readline';

const StatusRouter = Router().get('/status/:printerId', (req: Request, res: Response): any => {
  const printerId = req.params.printerId;

  if (!getStore().printers[printerId]) {
    return res.sendStatus(StatusCodes.NOT_FOUND);
  }

  const connection = StatusService.getSerialConnection(printerId);
  const parser = connection.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.once('data', (status: string) => {
    res.json({ printerId, status });
    parser.removeAllListeners();
  });

  connection.write('M105\n');
});

export default StatusRouter;