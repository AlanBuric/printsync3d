import express, { json, urlencoded } from 'express';
import cors from 'cors';
import ModelRouter from './routes/model/router.js';
import handleServerError from './middleware/error-handler.js';
import PrinterRouter from './routes/printer/router.js';

export default function createApplication() {
  return express()
    .use('', cors(), json(), urlencoded({ extended: true }))
    .use('/api/printer', PrinterRouter)
    .use('/api/model', ModelRouter())
    .use(handleServerError);
}
