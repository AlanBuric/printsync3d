import { Request, response, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import fileSystem from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import ModelService from './service.js';
import PrintSync3DConfig from '../../config/config.js';
import getLoggingPrefix from '../../util/logging.js';

dotenv.config();

const ModelRouter = () => {
  const GCODE_DIRECTORY = path.resolve(PrintSync3DConfig.GCODE_UPLOAD_DIRECTORY);

  if (!fileSystem.existsSync(GCODE_DIRECTORY)) {
    console.log(
      `${getLoggingPrefix()} GCODE directory doesn't exist. Creating one at ${GCODE_DIRECTORY}.`,
    );
    fileSystem.mkdirSync(GCODE_DIRECTORY, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: GCODE_DIRECTORY,
    filename: (_request, _file, callback) => callback(null, ModelService.createFilename()),
  });

  return Router()
    .get(
      '',
      (_request: Request, response: Response): Promise<any> =>
        fileSystem.promises
          .readdir(GCODE_DIRECTORY)
          .then((files) => response.send(files.map((file) => file.split('.')[0]))),
    )
    .post(
      '',
      multer({ storage }).array('files'),
      async (req: Request, res: Response): Promise<any> => {
        if (!req.files || !Object.keys(req.files).length) {
          return res.status(StatusCodes.BAD_REQUEST).send('No files uploaded');
        }

        response.sendStatus(StatusCodes.OK);
      },
    );
};

export default ModelRouter;
