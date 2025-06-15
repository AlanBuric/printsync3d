import express, { json, urlencoded } from 'express';
import cors from 'cors';
import ModelRouter from './routes/model/router.js';
import handleServerError from './middleware/error-handler.js';
import PrinterRouter from './routes/printer/router.js';
import healthcheck from './routes/healthcheck.js';

/**
 * Creates the Express application with all necessary middleware and routes.
 * @returns The configured Express application.
 */
export default function createApplication(): express.Express {
  return express()
    .use(cors(), json(), urlencoded({ extended: true }))
    .get('/health', healthcheck)
    .use('/api/printers', PrinterRouter)
    .use('/api/models', ModelRouter())
    .use(handleServerError);
}
