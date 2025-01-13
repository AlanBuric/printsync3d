<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import { ref } from 'vue';
  import { useModelStore } from '@/stores/models';
  import type { PrinterControlType } from '@shared-types/types';

  const FILAMENT_TYPES = ['PLA', 'ABS', 'PET'];

  const printerId = useRoute().params.id;
  const printer = usePrinterStore().printers.find(
    printer => printer.usb.productId === printerId
  );
  const fileSize = ref();

  const selectedModel = ref('');

  function calculateFileSize(bytes: number) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

    if (bytes === 0) {
      return '0 bytes';
    }

    const index = Math.min(Math.floor(Math.log2(bytes) / 10), units.length - 1);
    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(1)} ${units[index]}`;
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    fileSize.value = calculateFileSize(file.size);

    const body = new FormData();

    body.append('files', file);

    fetch('http://localhost:3000/api/upload', { method: 'POST', body }).then(response => {
      console.debug(response.status);
    });
  }

  function isFilamentReadyToBeLoaded(): boolean {
    const temperature = printer?.status.currentTemperature ?? 0;
    return temperature >= 190;
  }

  function sendControl(controlType: PrinterControlType) {
    fetch(`http://localhost:3000/api/controls/${printerId}`, {
      method: 'POST',
      body: JSON.stringify({ controlType })
    }).then(response => {
      console.debug(response.status);
    });
  }
</script>

<template>
  <main class="w-full px-20 flex flex-col gap-4 mt-10">
    <div class="flex flex-col gap-4 self-start min-w-80" v-if="printer">
      <h1 class="text-xl text-zinc-900 dark:text-zinc-100">{{ printer.name }}</h1>
      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
        <label for="gcode-upload" class="text-zinc-800 dark:text-zinc-200 text-lg">Upload GCODE file</label>
        <input
          type="file"
          accept=".gcode"
          id="gcode-upload"
          @change="handleFileUpload"
          class="mb-2">
        <span class="text-zinc-700 dark:text-zinc-400">Acceptable: .gcode files.</span>
      </div>

      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
        <label for="model-select" class="text-zinc-800 dark:text-zinc-200 text-lg">Select GCODE file</label>
        <select id="model-select" name="model" v-model="selectedModel" :disabled="!!printer.status.currentModel"
                class="text-zinc-800 bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-900 rounded-md py-1">
          <option value="" disabled selected>Select a recent model</option>
          <option v-for="model in useModelStore().models" :key="model.value" :value="model.text">
            {{ model.text }}
          </option>
        </select>
      </div>

      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
        <label for="preheat-filament" class="text-zinc-800 dark:text-zinc-200 text-lg">Preheat filament</label>
        <!-- :disabled="isFilamentReadyToBeLoaded" -->
        <select id="preheat-filament" name="preheat-filament"
                class="text-zinc-800 bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-900 rounded-md py-1">
          <option value="" disabled selected>Select a filament type</option>
          <option v-for="filament in FILAMENT_TYPES" :key="filament" :value="filament">{{ filament }}</option>
        </select>
      </div>

      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
        <span class="text-zinc-800 dark:text-zinc-200 text-lg">Control filament</span>
        <div class="gap-y-2 flex flex-col">
          <!-- :disabled="!isFilamentReadyToBeLoaded()" -->
          <button class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
                  @click="sendControl('load-filament')">Load
            filament
          </button>
          <button class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
                  @click="sendControl('unload-filament')">Unload
            filament
          </button>
        </div>
      </div>

      <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
        <span class="text-zinc-800 dark:text-zinc-200 text-lg">Calibrate</span>
        <div class="gap-y-2 flex flex-col">
          <button class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full" @click="sendControl('auto-home')">
            Auto home
          </button>
          <button class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
                  @click="sendControl('mesh-bed-leveling')">Mesh bed
            leveling
          </button>
          <button class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
                  @click="sendControl('reset-xyz-calibration')">Reset
            XYZ calibration
          </button>
        </div>
      </div>
    </div>
    <div class="text-center" v-else>
      <h3 class="text-2xl font-semibold text-zinc-400">Printer not found</h3>
      <p class="text-zinc-500 mt-2">It seems the printer you're looking for doesn't exist or isn't connected.</p>
    </div>
  </main>
</template>
