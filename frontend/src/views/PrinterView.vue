<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';

  const printerId = useRoute().params.id;
  const printer = usePrinterStore().printers.find(
    printer => printer.usb.productId === printerId
  );
</script>

<template>
  <main class="w-full px-4 max-w-3xl mx-auto flex items-center flex-col dark:text-zinc-100">
    <template v-if="printer">
      <section class="w-full space-y-4">
        <div class="bg-zinc-900 px-6 py-3 rounded-lg shadow-md">
          <h1 class="text-3xl font-semibold text-center text-cyan-400 mb-5">{{ printer.name }}</h1>
          <h2 class="text-xl font-bold text-zinc-200 mb-2">Printer Status</h2>
          <ul class="space-y-1 text-zinc-300">
            <li>
              <span>{{ 'Progress:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.status.progress }}</span>
            </li>
            <li>
              <span>{{ 'Current Model:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.status.currentModel }}</span>
            </li>
            <li>
              <span>{{ 'Temperature:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.status.currentTemperature }}°C</span>
            </li>
            <li>
              <span>{{ 'Paused:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.status.paused ? 'Yes' : 'No' }}</span>
            </li>
            <li>
              <span>{{ 'Axes Position:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.status.currentAxesPosition }}</span>
            </li>
          </ul>
        </div>

        <div class="bg-zinc-900 px-6 py-3 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-zinc-200 mb-2">USB Information</h2>
          <ul class="space-y-1 text-zinc-300">
            <li>
              <span>{{ 'Product ID:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.usb.productId }}</span>
            </li>
            <li>
              <span>{{ 'Vendor ID:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.usb.usbVendorId }}</span>
            </li>
            <li>
              <span>{{ 'Port:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.usb.port }}</span>
            </li>
            <li>
              <span>{{ 'Baud rate:' }}</span>
              <span class="ml-1 text-zinc-400">{{ printer.usb.baudRate }}</span>
            </li>
          </ul>
        </div>
      </section>
    </template>

    <template v-else>
      <div class="text-center mt-20">
        <h3 class="text-2xl font-semibold text-zinc-400">Printer not found</h3>
        <p class="text-zinc-500 mt-2">It seems the printer you’re looking for doesn’t exist or isn’t connected.</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
  h1 {
    @apply text-2xl dark:text-zinc-100;
  }
</style>
