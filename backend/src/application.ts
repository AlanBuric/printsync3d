import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ModelRouter from './routes/model/router.ts';
import PrinterRouter from './routes/printer/router.ts';
import handleServerErrors from './middleware/error-handler.ts';

export default function createApplication() {
  return new Hono()
    .use(cors())
    .route('/api/printer', PrinterRouter)
    .route('/api/model', ModelRouter)
    .onError(handleServerErrors);
}
