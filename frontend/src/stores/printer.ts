import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Printer } from '@/types';

type MockedPrinterArgs = {
  name: string;
  usbVendorId: string;
  productId: string;
  port: string
};

function createMockedPrinter({ name, usbVendorId, productId, port }: MockedPrinterArgs): Printer {
  return {
    name,
    usb: {
      usbVendorId,
      productId,
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
      usbVendorId: 'test',
      productId: 'test',
      port: '/dev/COM3'
    }),
    createMockedPrinter({
      name: 'Prusa i3 MK2',
      usbVendorId: 'test',
      productId: 'test',
      port: '/dev/ttyUSB0'
    }),
    createMockedPrinter({
      name: 'Prusa MK2S 1',
      usbVendorId: 'test',
      productId: 'test',
      port: '/dev/serial/by-id/usb-Prusa_Research'
    })
  ]);

  return { printers };
});
