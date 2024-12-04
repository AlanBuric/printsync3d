import application from './application.js';
import getStore from './store/store.js';
import GCodeService from './routes/gcode/service.js';

const DEFAULT_SERVER_PORT = 3000

function startPrinterWorker(printerId: string): void {
  const queue = (getStore().commandQueues[printerId] = []);

  const processQueue = () => {
    if (queue.length === 0) {
      setTimeout(processQueue, 100);
      return;
    }

    const gCode = queue.shift();

    if (gCode) {
      GCodeService.sendGCode(printerId, gCode)
        .then((response) => console.log(`Printer ${printerId}: ${response}`))
        .catch((err) => console.error(`Printer ${printerId}: ${err}`))
        .finally(processQueue);
    }
  };

  processQueue();
}

application.listen(process.env.PORT ?? DEFAULT_SERVER_PORT, () => {
  console.log('PrintSync3D service is listening on port ' + process.env.PORT);

  Object.keys(getStore().printers).forEach((printerId) => startPrinterWorker(printerId));
});