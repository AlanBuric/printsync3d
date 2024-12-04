import { Request, Response, Router } from 'express';
import getStore from '../../store/store.js';
import { StatusCodes } from 'http-status-codes';
import StatusService from './service.js';
import { ReadlineParser } from '@serialport/parser-readline';

const StatusRouter = Router()
  .get('/status/:printerId', async (req: Request, res: Response): Promise<any> => {
    const printerId = req.params.printerId;

    if (!getStore().printers[printerId]) {
      return res.sendStatus(StatusCodes.NOT_FOUND);
    }

    const serialPort = await StatusService.getSerialConnection(printerId);
    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.once('data', (status: string) => {
      res.json({ printerId, status });
      parser.removeAllListeners();
    });

    serialPort.write('M105\n');
  });

export default StatusRouter;