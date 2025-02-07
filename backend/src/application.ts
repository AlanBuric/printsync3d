import express from 'express';
import cors from 'npm:cors@2.8.5';
import ModelRouter from './routes/model/router.ts';
import handleServerError from './middleware/error-handler.ts';
import PrinterRouter from './routes/printer/router.ts';

export default function createApplication() {
  return express()
    .use('', cors(), express.json(), express.urlencoded({ extended: true }))
    .use('/api/printer', PrinterRouter)
    .use('/api/model', ModelRouter())
    .use(handleServerError);
}
