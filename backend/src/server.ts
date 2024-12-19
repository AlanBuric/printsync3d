import dotenv from 'dotenv';
import createApplication from './application.js';
import PrinterService from './routes/printer/service.js';

dotenv.config();

const DEFAULT_SERVER_PORT = 3000;

createApplication().listen(process.env.PORT ?? DEFAULT_SERVER_PORT, () => {
  console.log('PrintSync3D service is listening on port ' + process.env.PORT);

  PrinterService.refreshConnections();
});