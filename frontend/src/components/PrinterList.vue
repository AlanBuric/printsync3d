<script setup lang="ts">
  import { usePrinterStore } from '@/stores/printer.js';
  import TrashIcon from '@/components/icons/TrashIcon.vue';
  import InfoIcon from '@/components/icons/InfoIcon.vue';
</script>

<template>
  <section class="flex items-center flex-col w-full max-lg:px-4 gap-y-10" id="printers">
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-16 w-full">
      <li v-for="printer in usePrinterStore().printers" :key="printer.usb.productId">
        <ul
          class="flex items-center justify-between p-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-900 hover:dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 min-w-72 px-6 py-4 rounded-xl"
        >
          <li>
            <RouterLink :to="`/printer/${printer.usb.productId}`" class="flex w-full">
              <span class="flex-1 text-center cursor-pointer">{{ printer.name }}</span>
            </RouterLink>
          </li>
          <li>
            <ul class="flex gap-x-4">
              <li>
                <button class="hover:bg-gray-200 dark:hover:bg-zinc-800 p-2 rounded-full">
                  <RouterLink :to="`/printer/${printer.usb.productId}`">
                    <InfoIcon class="fill-cyan-500 hover:fill-cyan-400" />
                  </RouterLink>
                </button>
              </li>
              <li>
                <button
                  class="hover:bg-gray-200 dark:hover:bg-zinc-800 p-2 rounded-full"
                  @click="usePrinterStore().deletePrinter(printer.usb.productId)"
                >
                  <TrashIcon class="fill-cyan-500 hover:fill-cyan-400" />
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <div class="flex justify-center">
      <button
        class="rounded-full text-xl text-cyan-500 hover:text-cyan-400 bg-zinc-200 dark:bg-zinc-900 hover:dark:bg-zinc-950 hover:bg-gray-200 dark:hover:bg-zinc-800 w-10 h-10"
        @click="usePrinterStore().refreshPrinters(true)"
      >
        ⟳
      </button>
    </div>
  </section>
</template>
