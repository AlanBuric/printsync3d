import { reactive } from 'vue';
import { defineStore } from 'pinia';
import type { PrinterResponse } from '@shared-types/data-transfer-objects.ts';

export const usePrinterStore = defineStore('printer', () => {
  const printers = reactive<PrinterResponse[]>([
    {
      printerId: '/dev/ttyAMC0',
      displayName: 'Test Prusa i3 MK2S',
      progress: 100,
      currentModel: 'Vase',
      currentTemperature: 200,
      currentAxesPosition: { x: 0, y: 0, z: 0 },
      isFilamentLoaded: false,
      isPaused: false,
    },
  ]);

  function deletePrinter(printerId: string) {
    printers.splice(
      printers.findIndex((printer) => printer.printerId == printerId),
      1,
    );
  }

  function getPrinters(refresh: boolean = false) {
    fetch(`http://localhost:3000/api/${refresh ? 'printer/refresh' : 'printer'}`, {
      method: refresh ? 'POST' : 'GET',
    })
      .then((response) => response.json())
      .then((foundPrinters) => Object.assign(printers, foundPrinters));
  }

  //getPrinters();

  return { printers, deletePrinter, getPrinters };
});
