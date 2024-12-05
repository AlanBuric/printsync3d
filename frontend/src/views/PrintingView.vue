<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import { ref } from 'vue';
  import { useModelStore } from '@/stores/models';

  const printerId = useRoute().params.id;
  const printer = usePrinterStore().printers.find(
    printer => printer.usb.productId === printerId
  );

  const selectedModel = ref('');
</script>

<template>
  <main class="w-full px-20 flex flex-col gap-4 mt-10">
    <div class="flex flex-col gap-4 self-start min-w-80" v-if="printer">
      <h1 class="text-xl text-zinc-900 dark:text-zinc-100">{{ printer.name }}</h1>
      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-full">
        <select id="model-select" name="model" v-model="selectedModel"
                class="text-zinc-800 bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-900 rounded-md p-1">
          <option value="" disabled selected>Select your model</option>
          <option v-for="model in useModelStore().models" :key="model.value" :value="model.text">
            {{ model.text }}
          </option>
        </select><br>
      </div>

      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-full">
        <select id="temperature-action" name="temperature-action"
                class="text-zinc-800 bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-900 rounded-md p-1">
          <option value="" disabled selected>Preheat/Cooldown</option>
        </select><br>
      </div>

      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-full">
        <select id="control-filament" name="control-filament"
                class="text-zinc-800 bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-900 rounded-md p-1">
          <option value="" disabled selected>Control Filament</option>
        </select><br>
      </div>

      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-full">
        <select id="calibration" name="calibration"
                class="text-zinc-800 bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-900 rounded-md p-1">
          <option value="" disabled selected>Calibration</option>
        </select><br>
      </div>
    </div>
    <div class="text-center" v-else>
      <h3 class="text-2xl font-semibold text-zinc-400">Printer not found</h3>
      <p class="text-zinc-500 mt-2">It seems the printer you're looking for doesn't exist or isn't connected.</p>
    </div>
  </main>
</template>
