<script setup lang="ts">
  import { usePrinterStore } from '@/stores/printer.js';
  import TrashIcon from '@/components/icons/TrashIcon.vue';
  import InfoIcon from '@/components/icons/InfoIcon.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>

<template>
  <section class="flex items-center flex-col w-full max-lg:px-4 gap-y-10" id="printers">
    <ul
      v-if="usePrinterStore().printers.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-16 w-full"
    >
      <li v-for="printer in usePrinterStore().printers" :key="printer.printerId">
        <ul
          class="flex items-center justify-between p-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-900 hover:dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 min-w-72 px-6 py-4 rounded-xl"
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
            <ul class="flex gap-x-4">
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
                  @click="usePrinterStore().deletePrinter(printer.printerId)"
                >
                  <TrashIcon class="fill-cyan-500 hover:fill-cyan-400" />
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <p v-else>{{ t('noPrintersFound') }}</p>
    <div class="flex justify-center">
      <button
        class="rounded-full text-xl text-cyan-500 hover:text-cyan-400 bg-zinc-200 dark:bg-zinc-900 hover:dark:bg-zinc-950 hover:bg-gray-200 dark:hover:bg-zinc-800 px-4 py-1"
        @click="usePrinterStore().getPrinters(true)"
      >
        {{ t('refresh') }}
      </button>
    </div>
  </section>
</template>

<i18n>
{
  "en": {
    "refresh": "Refresh",
    "noPrintersFound": "No 3D printers have been detected yet."
  },
  "hr": {
    "refresh": "Osvježi",
    "noPrintersFound": "Novi 3D printeri nisu pronađeni."
  },
  "it": {
    "refresh": "Aggiorna",
    "noPrintersFound": "Non sono ancora state rilevate stampanti 3D."
  }
}
</i18n>
