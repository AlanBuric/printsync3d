import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Printer } from '@/types';

let lastIndex = 0;

type MockedPrinterArgs = {
  name: string;
  port: string;
};

function createMockedPrinter({ name, port }: MockedPrinterArgs): Printer {
  return {
    name,
    usb: {
      usbVendorId: `test-${lastIndex}`,
      productId: `test-${lastIndex++}`,
      port,
      baudRate: 115200,
    },
    status: {
      progress: 0,
      currentModel: 'Plastic Cup',
      currentTemperature: 200,
      currentAxesPosition: {
        x: 0,
        y: 0,
        z: 0,
      },
      isPaused: true,
      isFilamentLoaded: false,
    },
  };
}

export const usePrinterStore = defineStore('printer', () => {
  const printers = ref<Printer[]>([
    createMockedPrinter({
      name: 'Test Prusa i3 MK2S',
      port: '/dev/ttyUSB0',
    }),
  ]);

  function deletePrinter(productId: string) {
    printers.value = printers.value.filter((printer) => printer.usb.productId != productId);
  }

  function getPrinters(refresh: boolean = false) {
    fetch(`http://localhost:3000/api/${refresh ? 'refresh' : 'printer'}`, {
      method: refresh ? 'POST' : 'GET',
    })
      .then((response) => response.json())
      .then((foundPrinters) => (printers.value = foundPrinters));
  }

  getPrinters();

  return { printers, deletePrinter, getPrinters };
});
