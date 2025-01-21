<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { usePrinterStore } from '@/stores/printer';
  import PlayIcon from '@/components/icons/PlayIcon.vue';
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import EmptyState from '@/components/EmptyState.vue';

  const { t } = useI18n();

  const printerId = useRoute().params.id.toString();
  const printer = usePrinterStore().printers.find((printer) => printer.printerId === printerId);

  const editableDisplayName = ref(printer?.displayName);

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
</script>

<template>
  <main class="w-full px-4 gap-16 mt-10 flex justify-center">
    <div class="w-full max-w-screen-xl justify-center flex max-lg:flex-col gap-y-10">
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
          <div class="bg-zinc-200 dark:bg-zinc-900 px-5 py-4">
            <h2 class="text-xl text-zinc-800 dark:text-zinc-200 mb-2">{{ t('printerStatus') }}</h2>
            <ul class="space-y-1 text-zinc-800 dark:text-zinc-300">
              <li>
                <span>{{ t('progress') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{ printer.progress }}</span>
              </li>
              <li>
                <span>{{ t('currentModel') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  printer.currentModel
                }}</span>
              </li>
              <li>
                <span>{{ t('temperature') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400"
                  >{{ printer.currentTemperature }}°C</span
                >
              </li>
              <li>
                <span>{{ t('paused') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">{{
                  printer.isPaused ? t('yes') : t('no')
                }}</span>
              </li>
              <li>
                <span>{{ t('axesPosition') }}:</span>
                <span class="ml-1 text-zinc-700 dark:text-zinc-400">
                  {{ Object.values(printer.currentAxesPosition).join(', ') }}
                </span>
              </li>
            </ul>
          </div>

          <div class="flex gap-x-2">
            <RouterLink
              class="bg-zinc-200 dark:bg-zinc-900 p-2 rounded-xl flex"
              :to="`/printing/${encodeURIComponent(printer.printerId)}`"
              :title="t('startPrinting')"
            >
              <PlayIcon class="fill-zinc-500 hover:fill-zinc-600 dark:hover:fill-zinc-400" />
            </RouterLink>
          </div>
        </section>
        <section class="flex justify-center flex-grow">
          <div
            class="aspect-square border-zinc-950 dark:border-zinc-100 border-2 w-[80%] flex items-center justify-center self-start"
          >
            <h2 class="text-3xl dark:text-zinc-200 text-center">{{ t('printerPhoto') }}</h2>
          </div>
        </section>
      </template>

      <template v-else>
        <div class="text-center">
          <EmptyState
            header-locale-key="printerNotFound"
            description-locale-key="printerNotFoundDetails"
          />
        </div>
      </template>
    </div>
  </main>
</template>

<i18n>
{
  "en": {
    "printerStatus": "Printer status",
    "progress": "Progress",
    "currentModel": "Current model",
    "temperature": "Temperature",
    "paused": "Paused",
    "axesPosition": "Axes position",
    "yes": "Yes",
    "no": "No",
    "startPrinting": "Start printing",
    "printerPhoto": "Printer photo"
  },
  "hr": {
    "printerStatus": "Status printera",
    "progress": "Napredak",
    "currentModel": "Trenutni model",
    "temperature": "Temperatura",
    "paused": "Pauziran",
    "axesPosition": "Pozicije osi",
    "yes": "Da",
    "no": "Ne",
    "startPrinting": "Kreni printati",
    "printerPhoto": "Slika printera"
  },
  "it": {
    "printerStatus": "Stato della stampante",
    "progress": "Avanzamento",
    "currentModel": "Modello corrente",
    "temperature": "Temperatura",
    "paused": "In pausa",
    "axesPosition": "Posizione degli assi",
    "yes": "Sì",
    "no": "No",
    "startPrinting": "Avvia la stampa",
    "printerPhoto": "Foto della stampante"
  }
}
</i18n>
