import createApplication from './application.js';
import PrinterService from './routes/printer/service.js';
import chalk from 'chalk';
import { connectDatabase, getDatabase } from './database/database.js';
import PrintSync3DConfig from './config/config.js';
import ModelService from './routes/model/service.js';

const handleShutdown = async () => getDatabase().write();

new PrintSync3DConfig();
new PrinterService();
new ModelService();

await connectDatabase();

createApplication()
  .listen(PrintSync3DConfig.PORT, () => {
    console.log(
      chalk.blueBright.bold('✔ PrintSync3D service is up and running:'),
      '\n',
      chalk.blue(
        `➥ API routes: ${chalk.underline(`http://localhost:${PrintSync3DConfig.PORT}/api`)}`,
      ),
    );

    PrinterService.refreshConnections();
  })
  .on('close', handleShutdown);

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
