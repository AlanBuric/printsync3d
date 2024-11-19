<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';

  const printerId = useRoute().params.id;
  const printer = usePrinterStore().printers.find(printer => printer.usb.productId === printerId);
</script>

<template>
  <main class="w-full flex items-center flex-col dark:text-zinc-100">
    <template v-if="printer">
      <div class="space-y-2">
        <div>
          <h1 class="text-center text-2xl">{{ printer.name }}</h1>
          <h2>USB information</h2>
          <h3>Product ID: {{ printer.usb.productId }}</h3>
          <h3>Vendor ID: {{ printer.usb.usbVendorId }}</h3>
          <h3>Port: {{ printer.usb.port }}</h3>
          <h3>Baud rate: {{ printer.usb.baudRate }}</h3>
        </div>
        <div>
          <h2>Printer status</h2>
          <h3>Progress: {{ printer.status.progress }}</h3>
          <h3>Current printing model: {{ printer.status.currentModel }}</h3>
          <h3>Current temperature: {{ printer.status.currentTemperature }}</h3>
          <h3>Paused: {{ printer.status.paused }}</h3>
          <h3>Axes position: {{ printer.status.currentAxesPosition }}</h3>
        </div>
      </div>
    </template>
    <template v-else>
      <h3>Printer not found.</h3>
    </template>
  </main>
</template>

<style scoped>
  h3 {
    @apply text-lg dark:text-zinc-300;
  }

  h2 {
    @apply text-xl font-bold;
  }
</style>
