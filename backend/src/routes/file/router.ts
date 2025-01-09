import { Request, RequestHandler, response, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import fileSystem from 'fs';
import multer from 'multer';
import validateEnvVariable from '../../util/validate-env.js';
import dotenv from 'dotenv';

dotenv.config();

const FileRouter = () => {
  const GCODE_DIRECTORY = path.resolve(validateEnvVariable('GCODE_UPLOAD_DIRECTORY'));

  if (!fileSystem.existsSync(GCODE_DIRECTORY)) {
    console.log(`[${new Date().toISOString()}] GCODE directory doesn't exist. Creating one at ${GCODE_DIRECTORY}.`);
    fileSystem.mkdirSync(GCODE_DIRECTORY);
  }

  const upload = multer({ dest: GCODE_DIRECTORY }).single('file');

  return Router()
    .get(
      '/files',
      (request: Request, response: Response): Promise<any> =>
        fileSystem.promises
          .readdir(GCODE_DIRECTORY)
          .then((files) => response.send(files.map((file) => path.basename(GCODE_DIRECTORY, file)))),
    )
    .post('/upload', upload, async (req: Request, res: Response): Promise<any> => {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
      }

      response.sendStatus(StatusCodes.OK);
    });
}

export default FileRouter;
