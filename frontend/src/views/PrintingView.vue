<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import { ref } from 'vue';
  import { useModelStore } from '@/stores/models';
  import type { PrinterControlType } from '@shared-types/types';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const FILAMENT_TYPES = ['PLA', 'ABS', 'PET'];

  const printerId = useRoute().params.id.toString();
  const printer = usePrinterStore().printers.find((printer) => printer.printerId === printerId);

  const editableDisplayName = ref(printer?.displayName);
  const selectedModel = ref('');
  const fileSize = ref();

  function editPrinterDisplayName() {
    if (editableDisplayName.value == printer?.displayName) {
      return;
    }

    fetch(`http://localhost:3000/api/printer/${encodeURIComponent(printerId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: editableDisplayName.value }),
      headers: { 'Content-Type': 'application/json' },
    }).then(async (response) => {
      if (!response.ok) {
        editableDisplayName.value = printer?.displayName;
        alert(await response.text());
      }
    });
  }

  function calculateFileSize(bytes: number) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

    if (bytes === 0) {
      return '0 bytes';
    }

    const index = Math.min(Math.floor(Math.log2(bytes) / 10), units.length - 1);
    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(1)} ${units[index]}`;
  }

  function handleFileUpload(event: any) {
    const file = event.target.files[0];
    fileSize.value = calculateFileSize(file.size);

    const body = new FormData();

    body.append('files', file);

    fetch('http://localhost:3000/api/upload', { method: 'POST', body }).then((response) => {
      console.debug(response.status);
    });
  }

  function isFilamentReadyToBeLoaded(): boolean {
    const temperature = printer?.currentTemperature ?? 0;
    return temperature >= 190;
  }

  function sendControl(controlType: PrinterControlType) {
    fetch(`http://localhost:3000/api/controls/${encodeURIComponent(printerId)}`, {
      method: 'POST',
      body: JSON.stringify({ controlType }),
    }).then((response) => {
      console.debug(response.status);
    });
  }
</script>

<template>
  <main class="w-full flex justify-center px-20">
    <div class="w-full max-w-screen-2xl flex flex-col gap-4 mt-10">
      <div class="flex flex-col gap-4 self-start min-w-80" v-if="printer">
        <h1
          class="text-xl text-zinc-900 dark:text-zinc-100"
          contenteditable
          @input="({ target }) => (editableDisplayName = (target as any).innerText)"
          @blur="editPrinterDisplayName"
        >
          {{ editableDisplayName }}
        </h1>
        <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
          <label for="gcode-upload" class="text-zinc-800 dark:text-zinc-200 text-lg">
            {{ t('uploadGcodeFile') }}
          </label>
          <input
            type="file"
            accept=".gcode"
            id="gcode-upload"
            @change="handleFileUpload"
            class="mb-2"
          />
          <span class="text-zinc-700 dark:text-zinc-400">{{ t('acceptableFiles') }}</span>
        </div>

        <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
          <label for="model-select" class="text-zinc-800 dark:text-zinc-200 text-lg">{{
            t('selectGcodeFile')
          }}</label>
          <select
            id="model-select"
            name="model"
            v-model="selectedModel"
            :disabled="!!printer.currentModel"
            class="text-zinc-800 bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-900 rounded-md py-1"
          >
            <option value="" disabled selected>{{ t('selectRecentModel') }}</option>
            <option
              v-for="[modelId, modelName] in Object.entries(useModelStore().models)"
              :key="modelId"
              :value="modelId"
            >
              {{ modelName }}
            </option>
          </select>
        </div>

        <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
          <label for="preheat-filament" class="text-zinc-800 dark:text-zinc-200 text-lg">{{
            t('preheatFilament')
          }}</label>
          <select
            id="preheat-filament"
            name="preheat-filament"
            class="text-zinc-800 bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-900 rounded-md py-1"
          >
            <option value="" disabled selected>{{ t('selectFilamentType') }}</option>
            <option v-for="filament in FILAMENT_TYPES" :key="filament" :value="filament">
              {{ filament }}
            </option>
          </select>
        </div>

        <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
          <span class="text-zinc-800 dark:text-zinc-200 text-lg">{{ t('controlFilament') }}</span>
          <div class="gap-y-2 flex flex-col">
            <button
              class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
              @click="sendControl('load-filament')"
            >
              {{ t('loadFilament') }}
            </button>
            <button
              class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
              @click="sendControl('unload-filament')"
            >
              {{ t('unloadFilament') }}
            </button>
          </div>
        </div>

        <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-3xl flex flex-col">
          <span class="text-zinc-800 dark:text-zinc-200 text-lg">{{ t('calibrate') }}</span>
          <div class="gap-y-2 flex flex-col">
            <button
              class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
              @click="sendControl('auto-home')"
            >
              {{ t('autoHome') }}
            </button>
            <button
              class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
              @click="sendControl('mesh-bed-leveling')"
            >
              {{ t('meshBedLeveling') }}
            </button>
            <button
              class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-0.5 rounded-full"
              @click="sendControl('reset-xyz')"
            >
              {{ t('resetXYZCalibration') }}
            </button>
          </div>
        </div>
      </div>
      <div class="text-center" v-else>
        <h3 class="text-2xl font-semibold text-zinc-400">{{ t('printerNotFound') }}</h3>
        <p class="text-zinc-500 mt-2">
          {{ t('printerNotFoundDetailed') }}
        </p>
      </div>
    </div>
  </main>
</template>

<i18n>
{
  "en": {
    "uploadGcodeFile": "Upload GCODE file",
    "acceptableFiles": "Acceptable: .gcode files.",
    "selectGcodeFile": "Select GCODE file",
    "selectRecentModel": "Select a recent model",
    "preheatFilament": "Preheat filament",
    "selectFilamentType": "Select a filament type",
    "controlFilament": "Control filament",
    "loadFilament": "Load filament",
    "unloadFilament": "Unload filament",
    "calibrate": "Calibrate",
    "autoHome": "Auto home",
    "meshBedLeveling": "Mesh bed leveling",
    "resetXYZCalibration": "Reset XYZ calibration"
  },
  "hr": {
    "uploadGcodeFile": "Prenesi GCODE datoteku",
    "acceptableFiles": "Prihvatljivo: .gcode datoteke.",
    "selectGcodeFile": "Odaberi GCODE datoteku",
    "selectRecentModel": "Odaberi nedavni model",
    "preheatFilament": "Zagrijavanje filamenta",
    "selectFilamentType": "Odaberi vrstu filamenta",
    "controlFilament": "Upravljanje filamentom",
    "loadFilament": "Učitaj filament",
    "unloadFilament": "Isprazni filament",
    "calibrate": "Kalibracija",
    "autoHome": "Automatsko poravnanje",
    "meshBedLeveling": "Poravnanje mreže stola",
    "resetXYZCalibration": "Poništi XYZ kalibraciju"
  },
  "it": {
    "uploadGcodeFile": "Carica file GCODE",
    "acceptableFiles": "Accettabili: file .gcode.",
    "selectGcodeFile": "Seleziona file GCODE",
    "selectRecentModel": "Seleziona un modello recente",
    "preheatFilament": "Pre-riscalda filamento",
    "selectFilamentType": "Seleziona tipo di filamento",
    "controlFilament": "Controlla filamento",
    "loadFilament": "Carica filamento",
    "unloadFilament": "Scarica filamento",
    "calibrate": "Calibrazione",
    "autoHome": "Auto home",
    "meshBedLeveling": "Livellamento del piano",
    "resetXYZCalibration": "Reset calibrazione XYZ"
  }
}
</i18n>
