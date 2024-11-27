import express, { json, urlencoded } from 'express';
import { config } from 'dotenv';
import UploadRouter from './routes/upload/router.js';
import StatusRouter from './routes/status/router.js';
import ControlRouter from './routes/control/router.js';
import handleServerError from './middleware/error-handler.js';

config();

const application = express()
  .use(json(), urlencoded({ extended: true }))
  .use('/api', ControlRouter)
  .use('/api', StatusRouter)
  .use('/api', UploadRouter)
  .use(handleServerError);

export default application;
