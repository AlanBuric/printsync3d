import createApplication from './application.ts';
import PrinterService from './routes/printer/service.ts';
import ModelService from './routes/model/service.ts';
import { connectDatabase, getDatabase } from './database/database.ts';
import PrintSync3DConfig from './config/config.ts';
import getLoggingPrefix from './util/logging.ts';

new PrintSync3DConfig();
new PrinterService();
new ModelService();

await connectDatabase();

const PORT = PrintSync3DConfig.PORT;

console.info(
  `%c${getLoggingPrefix()} PrintSync3D is shutting down.`,
  'color: blue',
);

const controller = new AbortController();
const { signal } = controller;

Deno.serve({ port: PORT, signal }, createApplication().fetch);

PrinterService.refreshConnections();

const handleShutdown = async () => {
  console.info(
    `${getLoggingPrefix()} PrintSync3D is shutting down.`,
  );

  await getDatabase().write();
  controller.abort();
  Deno.exit();
};

const signals: Deno.Signal[] = ['SIGBREAK', 'SIGINT', 'SIGTERM'];

signals.forEach((signalName) => {
  try {
    Deno.addSignalListener(signalName, handleShutdown);
  } catch (_ignored) {
    // On Windows, an error may be thrown for SIGTERM.
  }
});
