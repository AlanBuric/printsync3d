import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Printer } from '@/types';

let lastIndex = 0;

type MockedPrinterArgs = {
  name: string;
  port: string
};

function createMockedPrinter({ name, port }: MockedPrinterArgs): Printer {
  return {
    name,
    usb: {
      usbVendorId: `test-${lastIndex}`,
      productId: `test-${lastIndex++}`,
      port,
      baudRate: 115200
    },
    status: {
      progress: 0,
      currentModel: 'Plastic Cup',
      currentTemperature: '200',
      currentAxesPosition: {
        x: 0,
        y: 0,
        z: 0
      },
      paused: true
    }
  };
}

// TODO: this is mocked data
export const usePrinterStore = defineStore('printer', () => {
  const printers = ref<Printer[]>([
    createMockedPrinter({
      name: 'Prusa i3 MK2S',
      port: '/dev/COM3'
    }),
    createMockedPrinter({
      name: 'Prusa i3 MK2',
      port: '/dev/ttyUSB0'
    }),
    createMockedPrinter({
      name: 'Prusa MK2S 1',
      port: '/dev/serial/by-id/usb-Prusa_Research-0'
    }),
    createMockedPrinter({
      name: 'Prusa MK2S 1',
      port: '/dev/serial/by-id/usb-Prusa_Research-1'
    }),
    createMockedPrinter({
      name: 'Prusa MK2S 1',
      port: '/dev/serial/by-id/usb-Prusa_Research-2'
    }),
    createMockedPrinter({
      name: 'Prusa MK2S 1',
      port: '/dev/serial/by-id/usb-Prusa_Research-3'
    })
  ]);

  return { printers };
});
