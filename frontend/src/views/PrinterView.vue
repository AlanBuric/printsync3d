<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import PlayIcon from '@/components/icons/PlayIcon.vue';
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import EmptyState from '@/components/EmptyState.vue';
  import { useModelStore } from '@/stores/models.ts';
  import type { PrinterControlType } from '@shared-types/types.ts';

  const FILAMENTS = {
    'preheat-pla': 'PLA',
    'preheat-abs': 'ABS',
    'preheat-pet': 'PET',
  };

  const { t } = useI18n();
  const modelStore = useModelStore();

  const printerId = useRoute().params.id.toString();
  const printer = usePrinterStore().printers.find((printer) => printer.printerId === printerId);

  const editableDisplayName = ref(printer?.displayName);
  const selectedFilamentType = ref('');
  const selectedModel = ref('');

  function editPrinterDisplayName() {
    if (editableDisplayName.value == printer?.displayName) {
      return;
    }

    fetch(`http://localhost:3000/api/printer/${encodeURIComponent(printerId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: editableDisplayName.value }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      if (!response.ok) {
        editableDisplayName.value = printer?.displayName;
        response.text().then(alert);
      }
    });
  }

  function formatTemperature(value: string | undefined): string {
    return value ? `${value} °C` : t('unknown');
  }

  /*function isFilamentReadyToBeLoaded(): boolean {
const temperature = printer?.temperatureReport.extruder ?? 0;
return temperature >= 190;
}*/

  function sendControl(controlType: PrinterControlType) {
    fetch(`http://localhost:3000/api/controls/${encodeURIComponent(printerId)}`, {
      method: 'POST',
      body: JSON.stringify({ controlType }),
    }).then((response) => {
      console.debug(response.status);
    });
  }

  function printModel() {
    if (!selectedModel.value) {
      alert(t('alertModelNotSelected'));
      return;
    }

    fetch(
      `http://localhost:3000/api/printer/${encodeURIComponent(printerId)}/print/${selectedModel.value}`,
      { method: 'POST' },
    ).then(async (response) => {
      if (response.ok) {
        alert(
          t('alertStartPrinting', {
            displayName: modelStore.models[selectedModel.value]?.displayName ?? 'Unknown',
          }),
        );
      } else {
        alert(await response.text());
      }
    });
  }
</script>

<template>
  <main class="w-full py-2 px-1 gap-16 mt-6 flex justify-center">
    <div class="w-full max-w-screen-md justify-center flex max-lg:flex-col gap-y-10">
      <template v-if="printer">
        <section class="gap-y-4 flex flex-col flex-grow">
          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-2 rounded-lg w-fit">
            <h1
              class="text-xl text-zinc-900 dark:text-zinc-100"
              contenteditable
              @input="({ target }) => (editableDisplayName = (target as any).innerText)"
              @blur="editPrinterDisplayName"
            >
              {{ editableDisplayName }}
            </h1>
          </div>
          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-2xl">
            <h2 class="text-xl text-zinc-800 dark:text-zinc-200 mb-3">
              {{ t('printerStatus') }}
            </h2>
            <ul class="space-y-1 text-zinc-800 dark:text-zinc-300">
              <li>
                <span>{{ t('progress') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  t('progressFormat', { progress: printer.progress })
                }}</span>
              </li>
              <li>
                <span>{{ t('currentModel') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  printer.currentModel
                }}</span>
              </li>
              <li>
                <span>{{ t('extruderTemperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  formatTemperature(printer.temperatureReport.extruder)
                }}</span>
              </li>
              <li>
                <span>{{ t('bedTemperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  formatTemperature(printer.temperatureReport.bed)
                }}</span>
              </li>
              <li>
                <span>{{ t('paused') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  printer.isPaused ? t('yes') : t('no')
                }}</span>
              </li>
              <!--<li>
                <span>{{ t('axesPosition') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ Object.values(printer.currentAxesPosition).join(', ') }}
                </span>
              </li>-->
            </ul>
          </div>

          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-2xl flex flex-col">
            <label for="model-select" class="text-zinc-800 dark:text-zinc-200 text-lg mb-3">{{
              t('printModelTitle')
            }}</label>
            <select
              id="model-select"
              name="model"
              v-model="selectedModel"
              :disabled="!printer.currentModel"
              class="text-zinc-800 invalid:text-zinc-500 bg-zinc-300 dark:text-zinc-200 dark:bg-zinc-800 rounded-md p-2 mb-2"
              required
            >
              <option value="" disabled selected hidden>{{ t('selectModel') }}</option>
              <option
                v-for="[modelId, model] in Object.entries(modelStore.models)"
                :key="modelId"
                :value="modelId"
              >
                {{ model.displayName }}
              </option>
            </select>
            <button
              class="flex text-zinc-800 dark:text-zinc-200 bg-zinc-300 dark:bg-zinc-800 p-2 rounded-md self-start gap-1 mb-4 disabled:dark:text-zinc-400 disabled:text-zinc-500"
              :disabled="!selectedModel"
              @click.prevent="printModel"
            >
              <PlayIcon
                class="fill-zinc-500 enabled:hover:fill-zinc-600 enabled:dark:hover:fill-zinc-400 disabled:fill-zinc-500 disabled:dark:fill-zinc-400"
              />
              <span>{{ t('printButton') }}</span>
            </button>
            <RouterLink to="/models" class="text-cyan-500 underline hover:no-underline"
              >{{ t('addNewModelLink') }}
            </RouterLink>
          </div>

          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-2xl flex flex-col">
            <label for="preheat-filament" class="text-zinc-800 dark:text-zinc-200 text-lg mb-3">{{
              t('filament')
            }}</label>
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-2">
                <select
                  v-model="selectedFilamentType"
                  id="preheat-filament"
                  name="preheat-filament"
                  class="text-zinc-800 invalid:text-zinc-500 bg-zinc-300 dark:text-zinc-200 dark:bg-zinc-800 rounded-md p-2 mb-2"
                  required
                >
                  <option value="" disabled selected hidden>{{ t('selectFilamentType') }}</option>
                  <option v-for="[control, name] in Object.entries(FILAMENTS)" :key="control" :value="control">
                    {{ name }}
                  </option>
                </select>
                <button
                  :disabled="!selectedFilamentType"
                  class="flex text-zinc-800 dark:text-zinc-200 bg-zinc-300 dark:bg-zinc-800 p-2 rounded-md self-start gap-1 mb-4 disabled:dark:text-zinc-400 disabled:text-zinc-500"
                  @click="sendControl(selectedFilamentType as any)"
                >
                  <PlayIcon
                    class="fill-zinc-500 enabled:hover:fill-zinc-600 enabled:dark:hover:fill-zinc-400 disabled:fill-zinc-500 disabled:dark:fill-zinc-400"
                  />
                  <span>{{ t('preheatFilament') }}</span>
                </button>
              </div>
              <div class="flex gap-2">
                <button
                  class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-1 rounded-lg grow"
                  @click="sendControl('load-filament')"
                >
                  {{ t('loadFilament') }}
                </button>
                <button
                  class="w-fit bg-zinc-300 dark:bg-zinc-700 px-2 py-1 rounded-lg grow"
                  @click="sendControl('unload-filament')"
                >
                  {{ t('unloadFilament') }}
                </button>
              </div>
            </div>
          </div>

          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-2xl flex flex-col">
            <span class="text-zinc-800 dark:text-zinc-200 text-lg mb-3">{{
              t('calibration')
            }}</span>
            <div class="w-full flex items-center justify-center gap-3 mb-8">
              <div class="inline-grid grid-rows-3 grid-cols-3 gap-1 items-center justify-center">
                <button
                  class="row-start-1 col-start-2 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg transform -rotate-90"
                  @click="sendControl('move-up')"
                  title="Up"
                >
                  ▶
                </button>
                <button
                  class="row-start-2 col-start-1 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-180"
                  @click="sendControl('move-left')"
                  title="Left"
                >
                  ▶
                </button>
                <button
                  class="row-start-2 col-start-3 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-0"
                  @click="sendControl('move-right')"
                  title="Right"
                >
                  ▶
                </button>
                <button
                  class="row-start-3 col-start-2 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-90"
                  @click="sendControl('move-down')"
                  title="Down"
                >
                  ▶
                </button>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  class="row-start-1 col-start-2 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg transform -rotate-90"
                  @click="sendControl('move-up')"
                  title="Forward"
                >
                  ▶
                </button>
                <button
                  class="row-start-3 col-start-2 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-90"
                  @click="sendControl('move-down')"
                  title="Backward"
                >
                  ▶
                </button>
              </div>
            </div>
            <div class="gap-2 flex w-full">
              <button
                class="bg-zinc-300 dark:bg-zinc-700 px-2 py-1 rounded-lg grow"
                @click="sendControl('auto-home')"
              >
                {{ t('autoHome') }}
              </button>
              <button
                class="bg-zinc-300 dark:bg-zinc-700 px-2 py-1 rounded-lg grow"
                @click="sendControl('mesh-bed-leveling')"
              >
                {{ t('meshBedLeveling') }}
              </button>
              <button
                class="bg-zinc-300 dark:bg-zinc-700 px-2 py-1 rounded-lg grow"
                @click="sendControl('reset-xyz')"
              >
                {{ t('resetXYZCalibration') }}
              </button>
            </div>
          </div>
        </section>
      </template>

      <div v-else class="text-center">
        <EmptyState
          header-locale-key="printerNotFound"
          description-locale-key="printerNotFoundDetails"
        />
      </div>
    </div>
  </main>
</template>

<i18n>
{
  "en": {
    "alertModelNotSelected": "Please select a model to print.",
    "alertStartPrinting": "'Printer will start printing {displayName}.'",
    "printerStatus": "Printer status",
    "progress": "Progress",
    "progressFormat": "{progress} commands",
    "currentModel": "Current model",
    "extruderTemperature": "Extruder temperature",
    "bedTemperature": "Bed temperature",
    "unknown": "Unknown",
    "paused": "Paused",
    "axesPosition": "Axes position",
    "yes": "Yes",
    "no": "No",
    "addNewModelLink": "Add a new model here",
    "printButton": "Print",
    "printerPhoto": "Printer photo",
    "printModelTitle": "Start printing",
    "selectModel": "Select a recent model",
    "preheatFilament": "Preheat filament",
    "filament": "Filament",
    "selectFilamentType": "Select a filament type...",
    "loadFilament": "Load filament",
    "unloadFilament": "Unload filament",
    "calibration": "Calibrate",
    "autoHome": "Auto home",
    "meshBedLeveling": "Mesh bed leveling",
    "resetXYZCalibration": "Reset XYZ calibration"
  },
  "hr": {
    "alertModelNotSelected": "Odaberite model za ispis.",
    "alertStartPrinting": "Printer će započeti ispisivanje {displayName}.",
    "printerStatus": "Status printera",
    "progress": "Napredak",
    "progressFormat": "{progress} naredbi",
    "currentModel": "Trenutni model",
    "extruderTemperature": "Temperatura mlaznice",
    "bedTemperature": "Temperatura podloge",
    "unknown": "Nepoznato",
    "paused": "Pauziran",
    "axesPosition": "Pozicije osi",
    "yes": "Da",
    "no": "Ne",
    "addNewModelLink": "Ovdje dodajte novi model",
    "printButton": "Isprintajte model",
    "printerPhoto": "Slika printera",
    "printModelTitle": "Printanje",
    "selectModel": "Odaberite spremljeni model...",
    "filament": "Filament",
    "preheatFilament": "Zagrij filament",
    "selectFilamentType": "Odaberite vrstu filamenta...",
    "loadFilament": "Učitaj filament",
    "unloadFilament": "Isprazni filament",
    "calibration": "Kalibracija",
    "autoHome": "Automatsko poravnanje",
    "meshBedLeveling": "Poravnanje mreže stola",
    "resetXYZCalibration": "Poništi XYZ kalibraciju"
  },
  "it": {
    "alertModelNotSelected": "Seleziona un modello da stampare.",
    "alertStartPrinting": "La stampante avvierà la stampa di {displayName}.",
    "progressFormat": "{progress} comandi",
    "bedTemperature": "Temperatura del piano di stampa",
    "unknown": "Sconosciuto",
    "addNewModelLink": "Clicca qui per aggiungere un nuovo modello",
    "printerStatus": "Stato della stampante",
    "progress": "Avanzamento",
    "currentModel": "Modello corrente",
    "temperature": "Temperatura",
    "paused": "In pausa",
    "axesPosition": "Posizione degli assi",
    "yes": "Sì",
    "no": "No",
    "printButton": "Stampa",
    "printerPhoto": "Foto della stampante",
    "printModelTitle": "Avvia la stampa",
    "selectModel": "Seleziona un modello recente",
    "preheatFilament": "Pre-riscalda il filamento",
    "selectFilamentType": "Seleziona tipo di filamento...",
    "loadFilament": "Carica filamento",
    "unloadFilament": "Rimuovi filamento",
    "calibration": "Calibrazione",
    "autoHome": "Esegui Auto home",
    "meshBedLeveling": "Livellamento del piano a rete",
    "resetXYZCalibration": "Reimposta la calibrazione XYZ"
  }
}
</i18n>
