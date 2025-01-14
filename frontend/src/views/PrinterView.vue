<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import PlayIcon from '@/components/icons/PlayIcon.vue';

  const printerId = useRoute().params.id;
  const printer = usePrinterStore().printers.find((printer) => printer.printerId === printerId);
</script>

<template>
  <main class="w-full px-4 gap-16 mt-10 flex justify-center">
    <div class="w-full max-w-screen-xl justify-center flex max-lg:flex-col gap-y-10">
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
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.progress }}</span>
              </li>
              <li>
                <span>Current model:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  printer.currentModel
                }}</span>
              </li>
              <li>
                <span>Temperature:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400"
                  >{{ printer.currentTemperature }}°C</span
                >
              </li>
              <li>
                <span>Paused:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  printer.isPaused ? 'Yes' : 'No'
                }}</span>
              </li>
              <li>
                <span>Axes position:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  Object.values(printer.currentAxesPosition).join(', ')
                }}</span>
              </li>
            </ul>
          </div>

          <div class="flex gap-x-2">
            <RouterLink
              class="bg-zinc-200 dark:bg-zinc-900 p-2 rounded-xl flex"
              :to="`/printing/${encodeURIComponent(printer.printerId)}`"
              title="Start printing"
            >
              <PlayIcon class="fill-zinc-500 hover:fill-zinc-600 dark:hover:fill-zinc-400" />
            </RouterLink>
          </div>
        </section>
        <section class="flex justify-center flex-grow">
          <div
            class="aspect-square border-zinc-950 dark:border-zinc-100 border-2 w-[80%] flex items-center justify-center self-start"
          >
            <h2 class="text-3xl dark:text-zinc-200 text-center">Printer photo</h2>
          </div>
        </section>
      </template>

      <template v-else>
        <div class="text-center">
          <h3 class="text-2xl font-semibold text-zinc-400">Printer not found</h3>
          <p class="text-zinc-500 mt-2">
            It seems the printer you're looking for doesn't exist or isn't connected.
          </p>
        </div>
      </template>
    </div>
  </main>
</template>
