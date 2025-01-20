import './assets/base.css';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { availableLocales, chooseAvailableLocale } from '@/scripts/translation.ts';

const locale = chooseAvailableLocale();

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  availableLocales: availableLocales.map((locale) => locale[0]),
  messages: {
    en: {
      printerNotFound: 'Printer not found',
      printerNotFoundDetailed:
        "It seems the printer you're looking for doesn't exist or isn't connected.",
    },
    hr: {
      printerNotFound: 'Printer nije pronađen',
      printerNotFoundDetailed: 'Izgleda da printer koji tražite ne postoji ili nije povezan.',
    },
    it: {
      printerNotFound: 'Stampante non trovata',
      printerNotFoundDetailed:
        'Sembra che la stampante che stai cercando non esista o non sia collegata.',
    },
  },
});

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app');
