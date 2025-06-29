import './assets/base.css';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { availableLocales, chooseAvailableLocale } from '@/scripts/translation.ts';
import { useModelStore } from './stores/models';
import { usePrinterStore } from './stores/printer';
import type { ModelResponse, PrinterResponse } from './scripts/types';

const locale = chooseAvailableLocale();

const i18n = createI18n({
  warnHtmlInMessage: false,
  legacy: false,
  locale,
  fallbackLocale: 'en',
  availableLocales: availableLocales.map((locale) => locale[0]),
  messages: {
    en: {
      editAction: 'Edit',
      refresh: 'Refresh',
      printerNotFound: 'Printer not found',
      printerNotFoundDetails:
        "It seems the printer you're looking for doesn't exist or isn't connected.",
    },
    hr: {
      editAction: 'Uredi',
      refresh: 'Osvježi',
      printerNotFound: 'Printer nije pronađen',
      printerNotFoundDetails: 'Izgleda da printer koji tražite ne postoji ili nije povezan.',
    },
    it: {
      editAction: 'Modifica',
      refresh: 'Aggiorna',
      printerNotFound: 'Stampante non trovata',
      printerNotFoundDetails:
        'Sembra che la stampante che stai cercando non esista o non sia collegata.',
    },
  },
});

const sseSource = new EventSource('/api/sse');

sseSource.addEventListener(
  'updatePrinters',
  ({ data }) => (usePrinterStore().printers = JSON.parse(data)),
);

sseSource.addEventListener('deletePrinter', ({ data }) => {
  const printers = usePrinterStore().printers;
  const otherPrinterId = JSON.parse(data);
  const index = printers.findIndex(({ printerId }) => printerId == otherPrinterId);

  if (index != -1) printers.splice(index, 1);
});

sseSource.addEventListener('updatePrinter', ({ data }) => {
  const printer: PrinterResponse = JSON.parse(data);
  const printers = usePrinterStore().printers;

  const index = printers.findIndex(({ printerId }) => printerId == printer.printerId);

  if (index != -1) printers[index] = printer;
});

sseSource.addEventListener('updateModels', ({ data }) => {
  const models: ModelResponse[] = JSON.parse(data);
  useModelStore().models = models;
});

sseSource.addEventListener('updateModel', ({ data }) => {
  const update: { displayName: string; modelId: string } = JSON.parse(data);
  const models = useModelStore().models;
  const index = models.findIndex(({ modelId }) => modelId == update.modelId);

  if (index != -1) Object.assign(models[index], update);
});

sseSource.addEventListener('deleteModel', ({ data }) => {
  const models = useModelStore().models;
  const otherModelId = JSON.parse(data);
  const index = models.findIndex(({ modelId }) => modelId == otherModelId);

  if (index != -1) models.splice(index, 1);
});

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app');
