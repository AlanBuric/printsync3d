import express, { json, Request, Response, urlencoded } from 'express';
import FileRouter from './routes/file/router.js';
import StatusRouter from './routes/status/router.js';
import ControlRouter from './routes/control/router.js';
import handleServerError from './middleware/error-handler.js';

export default function createApplication() {
  return express()
    .use('/printsync3d', express.static('static'))
    .get('/printsync3d', (request: Request, response: Response) => response.sendFile('index.html'))
    .use('/api',
      json(), urlencoded({ extended: true }),
      ControlRouter,
      StatusRouter,
      FileRouter,
      handleServerError);
}
