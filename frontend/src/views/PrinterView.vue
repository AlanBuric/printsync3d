<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import { ref } from 'vue';
  import UsbIcon from '@/components/icons/UsbIcon.vue';

  const printerId = useRoute().params.id;
  const printer = usePrinterStore().printers.find(
    printer => printer.usb.productId === printerId
  );

  const showUsbInformation = ref(false);

  function toggleUsbInformation() {
    showUsbInformation.value = !showUsbInformation.value;
  }
</script>

<template>
  <main class="w-full px-4 gap-16 mt-10 flex justify-center">
    <div class="w-full max-w-screen-xl flex max-lg:flex-col">
      <template v-if="printer">
        <section class="gap-y-4 flex flex-col flex-grow">
          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-2 rounded-lg w-fit">
            <h1 class="text-xl text-zinc-900 dark:text-zinc-100">{{ printer.name }}</h1>
          </div>
          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4">
            <h2 class="text-xl text-zinc-800 dark:text-zinc-200 mb-2">Printer status</h2>
            <ul class="space-y-1 text-zinc-800 dark:text-zinc-300">
              <li>
                <span>Progress:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.status.progress }}</span>
              </li>
              <li>
                <span>Current model:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.status.currentModel }}</span>
              </li>
              <li>
                <span>Temperature:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.status.currentTemperature }}°C</span>
              </li>
              <li>
                <span>Paused:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.status.paused ? 'Yes' : 'No' }}</span>
              </li>
              <li>
                <span>Axes position:</span>
                <span
                  class="ml-1 text-zinc-700 dark:text-zinc-400">{{ Object.values(printer.status.currentAxesPosition).join(', ')
                  }}</span>
              </li>
            </ul>
          </div>

          <div v-if="showUsbInformation" class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 flex">
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">USB information</h2>
              <ul class="space-y-1 text-zinc-800 dark:text-zinc-300">
                <li>
                  <span>Product ID:</span>
                  <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.usb.productId }}</span>
                </li>
                <li>
                  <span>Vendor ID:</span>
                  <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.usb.usbVendorId }}</span>
                </li>
                <li>
                  <span>Port:</span>
                  <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.usb.port }}</span>
                </li>
                <li>
                  <span>Baud rate:</span>
                  <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.usb.baudRate }}</span>
                </li>
              </ul>
            </div>
            <button @click="toggleUsbInformation"
                    class="border-t-zinc-400 dark:border-t-zinc-400 hover:border-t-zinc-500 dark:hover:border-t-zinc-300 self-start border-t-2 w-6 p-1">
            </button>
          </div>

          <div>
            <button v-if="!showUsbInformation" @click="toggleUsbInformation" title="Toggle USB information"
                    class="bg-zinc-200 dark:bg-zinc-900 p-2 rounded-xl flex">
              <UsbIcon class="fill-zinc-500 hover:fill-zinc-600 dark:hover:fill-zinc-400" />
            </button>
          </div>
        </section>
        <section class="flex justify-center flex-grow">
          <div
            class="aspect-square border-zinc-950 dark:border-zinc-100 border-2 w-[80%] flex items-center justify-center">
            <h2 class="text-3xl dark:text-zinc-200 text-center">
              Printer photo
            </h2>
          </div>
        </section>
      </template>

      <template v-else>
        <div class="text-center mt-20">
          <h3 class="text-2xl font-semibold text-zinc-400">Printer not found</h3>
          <p class="text-zinc-500 mt-2">It seems the printer you're looking for doesn't exist or isn't connected.</p>
        </div>
      </template>
    </div>
  </main>
</template>
