import dotenv from 'dotenv';
import createApplication from './application.js';
import PrinterService from './routes/printer/service.js';
import validateEnvVariable from './util/validate-env.js';
import chalk from 'chalk';

dotenv.config();

new PrinterService();

const port = validateEnvVariable('PORT');

createApplication().listen(port, () => {
  console.log(
    chalk.blueBright.bold('✔ PrintSync3D service is up and running:'),
    '\n',
    chalk.blue(`• Website route: ${chalk.underline(`http://localhost:${port}/printsync3d`)}`),
    '\n',
    chalk.blue(`• API route: ${chalk.underline(`http://localhost:${port}/api`)}`),
  );

  PrinterService.refreshConnections();
});
