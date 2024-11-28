import express, { json, Request, Response, urlencoded } from 'express';
import { config } from 'dotenv';
import UploadRouter from './routes/upload/router.js';
import StatusRouter from './routes/status/router.js';
import ControlRouter from './routes/control/router.js';
import handleServerError from './middleware/error-handler.js';

config();

const application = express()
  .use('/printsync3d', express.static('static'))
  .get('/printsync3d', (request: Request, response: Response) => response.sendFile('index.html'))
  .use(json(), urlencoded({ extended: true }))
  .use('/api', ControlRouter)
  .use('/api', StatusRouter)
  .use('/api', UploadRouter)
  .use(handleServerError);

export default application;
