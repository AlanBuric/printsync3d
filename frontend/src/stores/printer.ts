import { reactive } from 'vue';
import { defineStore } from 'pinia';
import type { PrinterResponse } from '@shared-types/data-transfer-objects.ts';

export const usePrinterStore = defineStore('printer', () => {
  const printers = reactive<PrinterResponse[]>([]);

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

  getPrinters();

  return { printers, deletePrinter, getPrinters };
});
