<script setup lang="ts">
  import { usePrinterStore } from '@/stores/printer.js';
</script>

<template>
  <section class="flex items-center flex-col gap-y-3 w-full">
    <h3 class="text-zinc-800 dark:text-zinc-300 text-3xl">Printers</h3>
    <div class="max-lg:w-full max-lg:px-4">
      <ul class="space-y-1 text-zinc-300 text-xl w-full">
        <li v-for="printer in usePrinterStore().printers" :key="printer.usb.productId"
            class="bg-zinc-900 min-w-96 px-4 py-3 rounded-xl hover:dark:bg-zinc-950 duration-150">
          <RouterLink :to="`/printer/${printer.usb.productId}`" class="flex w-full">
              <span class="text-cyan-500">▷ </span>
              <span class="flex-1 text-center">{{ printer.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </section>
</template>
