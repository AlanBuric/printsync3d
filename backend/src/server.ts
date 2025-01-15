import createApplication from './application.js';
import PrinterService from './routes/printer/service.js';
import chalk from 'chalk';
import { connectDatabase, getDatabase } from './database/database.js';
import PrintSync3DConfig from './config/config.js';
import ModelService from './routes/model/service.js';
import getLoggingPrefix from './util/logging.js';

new PrintSync3DConfig();
new PrinterService();
new ModelService();

await connectDatabase();

const server = createApplication().listen(PrintSync3DConfig.PORT, () => {
  console.log(
    chalk.blueBright.bold('✔ PrintSync3D service is up and running:'),
    '\n',
    chalk.blue(
      `➥ API routes: ${chalk.underline(`http://localhost:${PrintSync3DConfig.PORT}/api`)}`,
    ),
  );

  PrinterService.refreshConnections();
});

const handleShutdown = async () => {
  console.log(chalk.blueBright.bold(`${getLoggingPrefix()} PrintSync3D is shutting down.`));
  await getDatabase().write();
  server.close((error) => {
    console.error('An error occurred while shutting downthe PrintSync3D server', error);
  });
};

server.on('close', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
