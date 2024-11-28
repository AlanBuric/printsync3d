<script setup lang="ts">
  import { usePrinterStore } from '@/stores/printer.js';
  import TrashIcon from '@/components/icons/TrashIcon.vue';
  import InfoIcon from '@/components/icons/InfoIcon.vue';
</script>

<template>
  <section class="flex items-center flex-col gap-y-3 w-full">
    <h3 class="text-zinc-800 dark:text-zinc-300 text-3xl">Printers</h3>
    <div class="max-lg:w-full max-lg:px-4 flex flex-col gap-y-3">
      <ul class="space-y-1 text-zinc-300 text-xl w-full">
        <li v-for="printer in usePrinterStore().printers" :key="printer.usb.productId">
          <ul class="flex items-center gap-x-2">
            <li
              class="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-900 hover:dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 min-w-96 px-4 py-3 rounded-xl">
              <RouterLink :to="`/printer/${printer.usb.productId}`" class="flex w-full">
                <span class="flex-1 text-center">{{ printer.name }}</span>
              </RouterLink>
            </li>
            <li>
              <button>
                <InfoIcon class="fill-cyan-500 hover:fill-cyan-400" />
              </button>
            </li>
            <li>
              <button>
                <TrashIcon class="fill-cyan-500 hover:fill-cyan-400" />
              </button>
            </li>
          </ul>
        </li>
      </ul>
      <div class="flex justify-center">
        <button
          class="rounded-full text-cyan-500 hover:text-cyan-400 text-xl border-cyan-500 hover:border-cyan-400 border-2 px-2">
          +
        </button>
      </div>
    </div>
  </section>
</template>
