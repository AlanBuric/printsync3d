import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import fileSystem from 'fs';
import multer from 'multer';
import getStore from '../../store/store.js';

const GCODE_DIRECTORY = path.resolve(__dirname, 'gcode-files');

if (!fileSystem.existsSync(GCODE_DIRECTORY)) {
  fileSystem.mkdirSync(GCODE_DIRECTORY);
}

const upload = multer({ dest: GCODE_DIRECTORY });

const UploadRouter = Router().post(
  '/upload-gcode-and-print/:printerId',
  upload.single('file'),
  (req: Request, res: Response): any => {
    const printerId = req.params.printerId;

    if (!getStore().printers[printerId]) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Invalid printer ID' });
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
    }

    const filePath = path.resolve(GCODE_DIRECTORY, req.file.filename);

    fileSystem.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to read uploaded file' });
      }

      const lines = data.split('\n');
      getStore().commandQueues[printerId].push(...lines.map((line) => line.trim()));

      res.sendStatus(StatusCodes.OK);
    });
  }
);

export default UploadRouter;