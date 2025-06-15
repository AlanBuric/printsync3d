import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import type { PrinterResponse } from '@/scripts/types.js';

export const usePrinterStore = defineStore('printers', () => {
  const printers = reactive<PrinterResponse[]>([]);
  const isLoading = ref(false);

  function getPrinters(refresh: boolean = false) {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;

    fetch(`/api/${refresh ? 'printers/refresh' : 'printers'}`, {
      method: refresh ? 'POST' : 'GET',
    })
      .then((response) => response.json())
      .then((foundPrinters: PrinterResponse[]) => {
        printers.splice(0, printers.length);
        Object.assign(printers, foundPrinters);
      })
      .finally(() => (isLoading.value = false));
  }

  getPrinters();

  return { printers, isLoading, getPrinters };
});
