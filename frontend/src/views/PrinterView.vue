<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import PlayIcon from '@/components/icons/PlayIcon.vue';
  import { computed, nextTick, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import EmptyState from '@/components/EmptyState.vue';
  import { useModelStore } from '@/stores/models.ts';
  import type { PrinterControlType, TemperatureStatus } from '@/scripts/types.ts';
  import CoolDownIcon from '@/components/icons/CoolDownIcon.vue';
  import { useUIEdit } from '@/composables/useInputEdit';

  const { t } = useI18n();
  const FILAMENTS = computed(() => ({
    preheatPla: t('preheatPla'),
    preheatAbs: t('preheatAbs'),
    preheatPet: t('preheatPet'),
  }));
  const modelStore = useModelStore();

  const printerId = decodeURIComponent(useRoute().params.id.toString());
  const printer = computed(() =>
    usePrinterStore().printers.find((printer) => printer.printerId === printerId),
  );
  const isFilamentReadyToBeLoaded = computed(
    () => (printer.value?.temperatureReport.extruder?.actual ?? 0) >= 190,
  );
  const selectedFilamentType = ref(printer.value?.lastPreheatOption ?? '');
  const selectedModel = ref('');

  function submitNewDisplayName(newName: string) {
    fetch(`/api/printers/${encodeURIComponent(printerId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: newName }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      if (!response.ok) response.text().then(alert);
    });
  }

  const { isEditing, inputRef, startEditing, onInputKeydown, onSubmit, value } = useUIEdit(
    () => printer.value?.displayName,
    submitNewDisplayName,
  );

  /**
   * Formats a TemperatureStatus object.
   * If a target temperature is provided, it returns "actual °C / target °C",
   * otherwise just "actual °C". If the status is missing, returns the translated "unknown" string.
   */
  function formatTemperature(status: TemperatureStatus | undefined): string {
    if (!status) return t('unknown');

    let result = `${status.actual} °C`;

    if (status.target) result += ` / ${status.target} °C`;

    return result;
  }

  function sendControl(controlType: PrinterControlType) {
    fetch(`/api/printers/${encodeURIComponent(printerId)}/control`, {
      method: 'POST',
      body: JSON.stringify({ controlType }),
      headers: { 'Content-Type': 'application/json' },
    }).then(async (response) => {
      if (!response.ok) {
        alert(`Error: ${await response.text()}`);
      }
    });
  }

  function printModel() {
    if (!selectedModel.value) {
      alert(t('alertModelNotSelected'));
      return;
    }

    fetch(`/api/printers/${encodeURIComponent(printerId)}/print/${selectedModel.value}`, {
      method: 'POST',
    }).then(async (response) => {
      if (response.ok) {
        const displayName =
          modelStore.models.find((model) => model.modelId === selectedModel.value)?.displayName ??
          'Unknown';

        alert(t('alertStartPrinting', { displayName }));
      } else {
        alert(await response.text());
      }
    });
  }
</script>

<template>
  <main class="w-full px-1 py-8 gap-16 flex justify-center">
    <div class="w-full max-w-screen-md justify-center flex max-lg:flex-col gap-y-10">
      <template v-if="printer">
        <section class="gap-y-4 flex flex-col flex-grow">
          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-2 rounded-lg w-fit flex gap-2">
            <input
              v-if="isEditing"
              ref="inputRef"
              v-model.trim="value"
              @blur="onSubmit"
              @keydown="onInputKeydown"
              class="min-w-10 text-xl text-zinc-900 dark:text-zinc-100 px-0 py-0 bg-transparent border-none outline-none"
            />
            <template v-else>
              <h1 class="text-xl text-zinc-900 dark:text-zinc-100">
                {{ printer.displayName }}
              </h1>
              <button
                class="text-xs text-zinc-500 hover:underline ml-2"
                @click="startEditing"
                style="background: none; border: none; cursor: pointer"
              >
                {{ t('editAction') }}
              </button>
            </template>
          </div>

          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-xl">
            <h2 class="text-xl text-zinc-800 dark:text-zinc-200 mb-3">
              {{ t('printerStatus') }}
            </h2>
            <ul class="space-y-1 text-zinc-800 dark:text-zinc-300 mb-4">
              <li>
                <span>{{ t('currentStatus') }}</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ t(`status.${printer.status}`) }}
                </span>
              </li>
              <li>
                <span>{{ t('currentModel') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ printer.currentModel ? printer.currentModel : t('noCurrentModel') }}
                </span>
              </li>
              <li v-if="printer.temperatureReport.extruder">
                <span>{{ t('extruderTemperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ formatTemperature(printer.temperatureReport.extruder) }}
                </span>
              </li>
              <li v-for="(ext, index) in printer.temperatureReport.extruders" :key="index">
                <span>{{ t('extruderTemperature') }} {{ index }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ formatTemperature(ext) }}
                </span>
              </li>
              <li v-if="printer.temperatureReport.bed">
                <span>{{ t('bedTemperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ formatTemperature(printer.temperatureReport.bed) }}
                </span>
              </li>
              <li v-if="printer.temperatureReport.chamber">
                <span>{{ t('chamberTemperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ formatTemperature(printer.temperatureReport.chamber) }}
                </span>
              </li>
              <li v-if="printer.temperatureReport.hotendPower != null">
                <span>{{ t('hotendPower') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ printer.temperatureReport.hotendPower }}%
                </span>
              </li>
              <li v-if="printer.temperatureReport.bedPower != null">
                <span>{{ t('bedPower') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ printer.temperatureReport.bedPower }}%
                </span>
              </li>
              <li v-if="printer.temperatureReport.pinda != null">
                <span>{{ t('pindaTemperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ printer.temperatureReport.pinda }} °C
                </span>
              </li>
              <li v-if="printer.temperatureReport.ambient != null">
                <span>{{ t('ambientTemperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ printer.temperatureReport.ambient }} °C
                </span>
              </li>
            </ul>
            <div class="w-full flex gap-2">
              <button
                @click="sendControl('resume')"
                class="bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 px-3 py-1 rounded-xl flex-1"
              >
                {{ t('resume') }}
              </button>
              <button
                @click="sendControl('pause')"
                class="bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 px-3 py-1 rounded-xl flex-1"
              >
                {{ t('pause') }}
              </button>
              <button
                @click="sendControl('cancel')"
                class="bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 px-3 py-1 rounded-xl flex-1"
              >
                {{ t('cancel') }}
              </button>
            </div>
          </div>

          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-xl flex flex-col">
            <label for="model-select" class="text-zinc-800 dark:text-zinc-200 text-lg mb-3">
              {{ t('printModelTitle') }}
            </label>
            <select
              id="model-select"
              name="model"
              v-model="selectedModel"
              :disabled="!printer.currentModel"
              class="text-zinc-800 invalid:text-zinc-500 bg-zinc-300 dark:text-zinc-200 dark:bg-zinc-800 rounded-md p-2 mb-2"
              required
            >
              <option value="" disabled selected hidden>
                {{ t('selectModel') }}
              </option>
              <option
                v-for="[modelId, model] in Object.entries(modelStore.models)"
                :key="modelId"
                :value="modelId"
              >
                {{ model.displayName }}
              </option>
            </select>
            <button
              class="flex text-zinc-800 dark:text-zinc-300 bg-zinc-300 dark:bg-zinc-700 enabled:hover:bg-zinc-400 enabled:dark:hover:bg-zinc-800 p-2 rounded-md self-start gap-1 mb-4 disabled:dark:text-zinc-400 disabled:text-zinc-500 transition"
              :disabled="!selectedModel"
              @click.prevent="printModel"
            >
              <PlayIcon
                class="fill-zinc-500 enabled:hover:fill-zinc-600 enabled:dark:hover:fill-zinc-400 disabled:fill-zinc-500 disabled:dark:fill-zinc-400"
              />
              <span>{{ t('printButton') }}</span>
            </button>
            <RouterLink to="/models" class="text-cyan-500 underline hover:no-underline">
              {{ t('addNewModelLink') }}
            </RouterLink>
          </div>

          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-xl flex flex-col">
            <label for="preheat-filament" class="text-zinc-800 dark:text-zinc-200 text-lg mb-3">
              {{ t('filament') }}
            </label>
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-2">
                <select
                  v-model="selectedFilamentType"
                  id="preheat-filament"
                  name="preheat-filament"
                  class="text-zinc-800 invalid:text-zinc-500 bg-zinc-300 dark:text-zinc-300 dark:bg-zinc-800 rounded-md p-2 mb-2"
                  required
                >
                  <option value="" disabled selected hidden>
                    {{ t('selectFilamentType') }}
                  </option>
                  <option
                    v-for="[control, name] in Object.entries(FILAMENTS)"
                    :key="control"
                    :value="control"
                  >
                    {{ name }}
                  </option>
                </select>
                <div class="w-full flex gap-2 mb-4">
                  <button
                    :disabled="!selectedFilamentType"
                    class="flex text-zinc-800 dark:text-zinc-300 bg-zinc-300 dark:bg-zinc-700 enabled:hover:bg-zinc-400 enabled:dark:hover:bg-zinc-800 p-2 rounded-md gap-1 disabled:dark:text-zinc-400 disabled:text-zinc-500 transition"
                    @click="sendControl(selectedFilamentType as any)"
                  >
                    <PlayIcon
                      class="fill-zinc-500 enabled:hover:fill-zinc-600 enabled:dark:hover:fill-zinc-400 disabled:fill-zinc-500 disabled:dark:fill-zinc-400"
                    />
                    <span>{{ t('preheatFilament') }}</span>
                  </button>
                  <button
                    class="flex text-zinc-800 dark:text-zinc-300 hover:bg-zinc-400 dark:hover:bg-zinc-800 bg-zinc-300 dark:bg-zinc-700 p-2 rounded-md gap-1 disabled:dark:text-zinc-400 disabled:text-zinc-500 transition"
                    @click="sendControl('coolDown')"
                  >
                    <CoolDownIcon
                      class="fill-zinc-500 hover:fill-zinc-600 dark:hover:fill-zinc-400"
                    />
                    <span>{{ t('coolDown') }}</span>
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="w-fit bg-zinc-300 dark:bg-zinc-700 enabled:hover:bg-zinc-400 enabled:dark:hover:bg-zinc-800 px-2 py-1 rounded-lg grow transition"
                  @click="sendControl('loadFilament')"
                  :disabled="isFilamentReadyToBeLoaded"
                >
                  {{ t('loadFilament') }}
                </button>
                <button
                  class="w-fit bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg grow transition"
                  @click="sendControl('unloadFilament')"
                >
                  {{ t('unloadFilament') }}
                </button>
              </div>
            </div>
          </div>

          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4 rounded-xl flex flex-col">
            <span class="text-zinc-800 dark:text-zinc-200 text-lg mb-3">
              {{ t('calibration') }}
            </span>
            <div class="w-full flex items-center justify-center gap-3 mb-8">
              <div class="inline-grid grid-rows-3 grid-cols-3 gap-1 items-center justify-center">
                <button
                  class="row-start-1 col-start-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg transform -rotate-90 transition"
                  @click="sendControl('moveUp')"
                  title="Up"
                >
                  ▶
                </button>
                <button
                  class="row-start-2 col-start-1 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-180 transition"
                  @click="sendControl('moveLeft')"
                  title="Left"
                >
                  ▶
                </button>
                <button
                  class="row-start-2 col-start-3 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-0 transition"
                  @click="sendControl('moveRight')"
                  title="Right"
                >
                  ▶
                </button>
                <button
                  class="row-start-3 col-start-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-90 transition"
                  @click="sendControl('moveDown')"
                  title="Down"
                >
                  ▶
                </button>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  class="row-start-1 col-start-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg transform -rotate-90 transition"
                  @click="sendControl('moveUp')"
                  title="Forward"
                >
                  ▶
                </button>
                <button
                  class="row-start-3 col-start-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg transform rotate-90 transition"
                  @click="sendControl('moveDown')"
                  title="Backward"
                >
                  ▶
                </button>
              </div>
            </div>
            <div class="gap-2 flex w-full">
              <button
                class="bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg grow transition"
                @click="sendControl('autoHome')"
              >
                {{ t('autoHome') }}
              </button>
              <button
                class="bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg grow transition"
                @click="sendControl('meshBedLeveling')"
              >
                {{ t('meshBedLeveling') }}
              </button>
              <button
                class="bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-800 px-2 py-1 rounded-lg grow transition"
                @click="sendControl('resetXyz')"
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
    "alertStartPrinting": "Printer will start printing {displayName}.",
    "printerStatus": "Printer status",
    "currentModel": "Current printing model",
    "extruderTemperature": "Extruder temperature",
    "bedTemperature": "Bed temperature",
    "chamberTemperature": "Chamber temperature",
    "hotendPower": "Hotend power",
    "bedPower": "Bed power",
    "pindaTemperature": "PINDA temperature",
    "ambientTemperature": "Ambient temperature",
    "unknown": "Unknown",
    "paused": "Paused",
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
    "resetXYZCalibration": "Reset XYZ calibration",
    "noCurrentModel": "none",
    "coolDown": "Cooldown",
    "resume": "Resume",
    "pause": "Pause",
    "cancel": "Cancel",
    "preheatPla": "PLA (bed 60 °C, extruder 215 °C)",
    "preheatAbs": "ABS (bed 100 °C, extruder 240 °C)",
    "preheatPet": "PET (bed 90 °C, extruder 230 °C)",
    "printerNotFound": "Printer not found",
    "printerNotFoundDetails": "The requested printer was not found.",
    "currentStatus": "State:",
    "status": {
      "idle": "Idle",
      "printing": "Printing",
      "paused": "Paused"
    }
  },
  "hr": {
    "alertModelNotSelected": "Odaberite model za ispis.",
    "alertStartPrinting": "Printer će započeti ispisivanje {displayName}.",
    "printerStatus": "Status printera",
    "currentModel": "Trenutni model na ispisu",
    "extruderTemperature": "Temperatura mlaznice",
    "bedTemperature": "Temperatura podloge",
    "chamberTemperature": "Temperatura komore",
    "hotendPower": "Snaga mlaznice",
    "bedPower": "Snaga podloge",
    "pindaTemperature": "PINDA temperatura",
    "ambientTemperature": "Ambijentalna temperatura",
    "unknown": "Nepoznato",
    "paused": "Pauziran",
    "yes": "Da",
    "no": "Ne",
    "addNewModelLink": "Ovdje dodajte novi model",
    "printButton": "Ispis",
    "printerPhoto": "Slika printera",
    "printModelTitle": "Printanje",
    "selectModel": "Odaberite spremljeni model...",
    "preheatFilament": "Zagrij filament",
    "filament": "Filament",
    "selectFilamentType": "Odaberite vrstu filamenta...",
    "loadFilament": "Učitaj filament",
    "unloadFilament": "Isprazni filament",
    "calibration": "Kalibracija",
    "autoHome": "Automatsko poravnanje",
    "meshBedLeveling": "Poravnanje mreže stola",
    "resetXYZCalibration": "Poništi XYZ kalibraciju",
    "noCurrentModel": "nijedan",
    "coolDown": "Ohladi",
    "resume": "Nastavi s radom",
    "pause": "Pauziraj rad",
    "cancel": "Prekid rada",
    "preheatPla": "PLA (podloga 60 °C, mlaznica 215 °C)",
    "preheatAbs": "ABS (podloga 100 °C, mlaznica 240 °C)",
    "preheatPet": "PET (podloga 90 °C, mlaznica 230 °C)",
    "printerNotFound": "Printer nije pronađen",
    "printerNotFoundDetails": "Traženi printer nije pronađen.",
    "currentStatus": "Stanje:",
    "status": {
      "idle": "Mirovanje",
      "printing": "Ispisuje",
      "paused": "Pauziran"
    }
  },
  "it": {
    "alertModelNotSelected": "Seleziona un modello da stampare.",
    "alertStartPrinting": "La stampante avvierà la stampa di {displayName}.",
    "printerStatus": "Stato della stampante",
    "currentModel": "Modello corrente",
    "extruderTemperature": "Temperatura dell'estrusore",
    "bedTemperature": "Temperatura del piano di stampa",
    "chamberTemperature": "Temperatura della camera",
    "hotendPower": "Potenza dell'estrusore",
    "bedPower": "Potenza del piano",
    "pindaTemperature": "Temperatura PINDA",
    "ambientTemperature": "Temperatura ambiente",
    "unknown": "Sconosciuto",
    "paused": "In pausa",
    "yes": "Sì",
    "no": "No",
    "addNewModelLink": "Clicca qui per aggiungere un nuovo modello",
    "printButton": "Stampa",
    "printerPhoto": "Foto della stampante",
    "printModelTitle": "Avvia la stampa",
    "selectModel": "Seleziona un modello recente",
    "preheatFilament": "Pre-riscalda il filamento",
    "filament": "Filamento",
    "selectFilamentType": "Seleziona tipo di filamento...",
    "loadFilament": "Carica filamento",
    "unloadFilament": "Rimuovi filamento",
    "calibration": "Calibrazione",
    "autoHome": "Esegui Auto home",
    "meshBedLeveling": "Livellamento del piano a rete",
    "resetXYZCalibration": "Reimposta la calibrazione XYZ",
    "noCurrentModel": "nessun",
    "coolDown": "Raffredda",
    "resume": "Continua",
    "pause": "Pausa",
    "cancel": "Annulla",
    "preheatPla": "PLA (piano 60 °C, estrusore 215 °C)",
    "preheatAbs": "ABS (piano 100 °C, estrusore 240 °C)",
    "preheatPet": "PET (piano 90 °C, estrusore 230 °C)",
    "printerNotFound": "Stampante non trovata",
    "printerNotFoundDetails": "La stampante richiesta non è stata trovata.",
    "currentStatus": "Stato:",
    "status": {
      "idle": "Inattivo",
      "printing": "Stampa in corso",
      "paused": "In pausa"
    }
  }
}
</i18n>
