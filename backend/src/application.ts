import express, { json, Request, Response, urlencoded } from 'express';
import cors from 'cors';
import FileRouter from './routes/file/router.js';
import StatusRouter from './routes/status/router.js';
import ControlRouter from './routes/control/router.js';
import handleServerError from './middleware/error-handler.js';
import PrinterRouter from './routes/printer/router.js';

export default function createApplication() {
  return express()
    .use('/printsync3d', express.static('static'))
    .get('/printsync3d', (_request: Request, response: Response) => response.sendFile('index.html'))
    .use(
      '/api',
      cors(),
      json(),
      urlencoded({ extended: true }),
      PrinterRouter,
      ControlRouter,
      StatusRouter,
      FileRouter,
      handleServerError,
    );
}
