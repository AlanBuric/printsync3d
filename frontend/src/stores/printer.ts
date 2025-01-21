import { reactive, ref } from 'vue';
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
  const isLoading = ref(false);

  function deletePrinter(printerId: string) {
    printers.splice(
      printers.findIndex((printer) => printer.printerId == printerId),
      1,
    );
  }

  function getPrinters(refresh: boolean = false) {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;

    fetch(`http://localhost:3000/api/${refresh ? 'printer/refresh' : 'printer'}`, {
      method: refresh ? 'POST' : 'GET',
    })
      .then((response) => response.json())
      .then((foundPrinters) => Object.assign(printers, foundPrinters))
      .finally(() => (isLoading.value = false));
  }

  //getPrinters();

  return { printers, isLoading, deletePrinter, getPrinters };
});
