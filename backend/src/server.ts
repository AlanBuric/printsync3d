import createApplication from './application.js';
import PrinterService from './routes/printer/service.js';
import { connectDatabase, getDatabase } from './database/database.js';
import PrintSync3DConfig from './config/config.js';
import ModelService from './routes/model/service.js';
import getLoggingPrefix from './util/logging.js';
import { styleText } from 'util';

new PrintSync3DConfig();
new PrinterService();
new ModelService();

await connectDatabase();

const server = createApplication().listen(PrintSync3DConfig.PORT, () => {
  console.info(
    styleText(['blueBright', 'bold'], '✔ PrintSync3D service is up and running:'),
    '\n',
    styleText(
      ['blue'],
      `➥ API routes: ${styleText(['underline'], `http://localhost:${PrintSync3DConfig.PORT}/api`)}`,
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
