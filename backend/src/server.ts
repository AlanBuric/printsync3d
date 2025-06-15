import createApplication from './application.js';
import PrinterService from './routes/printer/service.js';
import { connectDatabase, getDatabase } from './database/database.js';
import EnvConfig from './config/config.js';
import ModelService from './routes/model/service.js';
import getLoggingPrefix from './util/logging.js';
import { styleText } from 'util';

EnvConfig.initialize();
await connectDatabase();
ModelService.initialize();

const server = createApplication().listen(EnvConfig.PORT, () => {
  console.info(
    styleText(['blueBright', 'bold'], '✔ PrintSync3D service is up and running:'),
    '\n',
    styleText(
      ['blue'],
      `➥ API routes: ${styleText(['underline'], `http://localhost:${EnvConfig.PORT}/api`)}`,
    ),
    '\n',
    styleText(
      ['blue'],
      `➥ Healthcheck: ${styleText(['underline'], `http://localhost:${EnvConfig.PORT}/health`)}`,
    ),
  );

  PrinterService.refreshConnections();
});

const handleShutdown = async () => {
  console.info(
    styleText(['blueBright', 'bold'], `${getLoggingPrefix()} PrintSync3D is shutting down.`),
  );

  await getDatabase().write();

  server.close((error) => {
    if (error) {
      console.error('An error occurred while shutting downthe PrintSync3D server', error);
    }

    process.exit(0);
  });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
