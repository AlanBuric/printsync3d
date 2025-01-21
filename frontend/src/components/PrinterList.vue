<script setup lang="ts">
  import { usePrinterStore } from '@/stores/printer.js';
  import TrashIcon from '@/components/icons/TrashIcon.vue';
  import InfoIcon from '@/components/icons/InfoIcon.vue';
  import EmptyState from '@/components/EmptyState.vue';
  import RefreshButton from '@/components/RefreshButton.vue';

  const store = usePrinterStore();
</script>

<template>
  <section class="flex items-center flex-col w-full max-lg:px-4 gap-y-10" id="printers">
    <ul
      v-if="store.printers.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-16 w-full"
    >
      <li v-for="printer in store.printers" :key="printer.printerId">
        <ul
          class="flex items-center justify-between bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-900 hover:dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 min-w-72 px-4 py-3 rounded-xl gap-x-1"
        >
          <li>
            <RouterLink
              :to="`/printer/${encodeURIComponent(printer.printerId)}`"
              class="flex w-full"
            >
              <span class="flex-1 text-center cursor-pointer">{{ printer.displayName }}</span>
            </RouterLink>
          </li>
          <li>
            <ul class="flex gap-x-2">
              <li>
                <button class="hover:bg-gray-200 dark:hover:bg-zinc-800 p-2 rounded-full">
                  <RouterLink :to="`/printer/${encodeURIComponent(printer.printerId)}`">
                    <InfoIcon class="fill-cyan-500 hover:fill-cyan-400" />
                  </RouterLink>
                </button>
              </li>
              <li>
                <button
                  class="hover:bg-gray-200 dark:hover:bg-zinc-800 p-2 rounded-full"
                  @click="store.deletePrinter(printer.printerId)"
                >
                  <TrashIcon class="fill-cyan-500 hover:fill-cyan-400" />
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <EmptyState
      v-else
      header-locale-key="noPrintersFound"
      description-locale-key="noPrintersFoundDetails"
    />
    <div class="flex justify-center">
      <RefreshButton @click="store.getPrinters(true)" :is-loading="store.isLoading" />
    </div>
  </section>
</template>

<i18n>
{
  "en": {
    "noPrintersFound": "No 3D printers found",
    "noPrintersFoundDetails": "No 3D printers have been detected yet, try plugging one into this computer."
  },
  "hr": {
    "noPrintersFound": "3D printeri nisu pronađeni",
    "noPrintersFoundDetails": "Još nisu pronađeni 3D printeri, pokušajte spojiti jedan na ovo računalo."
  },
  "it": {
    "refresh": "Aggiorna",
    "noPrintersFound": "Non sono ancora state rilevate stampanti 3D",
    "noPrintersFoundDetails": "Non sono ancora state rilevate stampanti 3D, prova a collegarne una a questo computer."
  }
}
</i18n>
