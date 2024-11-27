import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import GCodeService from '../gcode/service.js';
import getStore from '../../store/store.js';

const ControlRouter = Router()
  .post('/control/:printerId', async (req: Request, res: Response): Promise<any> => {
    const printerId = req.params.printerId;
    const { gCode } = req.body;

    if (!printerId || !gCode) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Printer ID and GCode are required' });
    }

    const result = await GCodeService.sendGCode(printerId, gCode);

    res.json({ message: result });
  })
  .post('/calibration/:printerId', (req: Request, res: Response): any => {
    const printerId = req.params.printerId;
    const { action } = req.body;

    if (!getStore().printers[printerId]) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Invalid printer ID' });
    }

    if (!action) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Action is required' });
    }

    if (action === 'auto_home') {
      getStore().commandQueues[printerId].push('G28');
    } else if (action === 'bed_leveling') {
      getStore().commandQueues[printerId].push('G80', 'G29');
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid action' });
    }

    res.sendStatus(StatusCodes.OK);
  })
  .post('/temperature/:printerId', (req: Request, res: Response): any => {
    const printerId = req.params.printerId;
    const { hotendTemp, bedTemp } = req.body;

    if (!getStore().printers[printerId]) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Invalid printer ID' });
    }

    if (hotendTemp) {
      getStore().commandQueues[printerId].push(`M104 S${hotendTemp}`);
    }

    if (bedTemp) {
      getStore().commandQueues[printerId].push(`M140 S${bedTemp}`);
    }

    res.sendStatus(StatusCodes.OK);
  });

export default ControlRouter;