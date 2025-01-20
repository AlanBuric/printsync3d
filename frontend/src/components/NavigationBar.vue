<script setup lang="ts">
  import ThemeSwitch from '@/components/ThemeSwitch.vue';
  import LanguageSwitch from '@/components/LanguageSwitch.vue';
  import { useRoute } from 'vue-router';
  import useGlobalStore from '@/stores/global';
  import { usePrinterStore } from '@/stores/printer';
  import { getRandomElement } from '@/scripts/utils';
  import { useI18n } from 'vue-i18n';

  const route = useRoute();
  const randomPrinter = getRandomElement(usePrinterStore().printers);
  const { t } = useI18n();
</script>

<template>
  <div
    role="banner"
    class="bg-white dark:bg-zinc-900 w-full flex justify-center items-center shadow-md py-2 px-4 text-sm"
  >
    <div class="w-full max-w-screen-2xl flex justify-between items-center">
      <div class="flex items-center gap-6">
        <RouterLink to="/">
          <img
            v-if="useGlobalStore().isDarkTheme()"
            alt="PrintSync3D logo"
            src="../assets/images/white-navbar.png"
            width="40"
            height="40"
            class="pointer-events-none select-none"
          />
          <img
            v-else
            alt="PrintSync3D logo"
            src="../assets/images/black-navbar.png"
            width="40"
            height="40"
            class="pointer-events-none select-none"
          />
        </RouterLink>
        <nav class="flex items-center gap-6 text-sm">
          <a
            v-if="route.path == '/'"
            href="#printers"
            class="flex text-lg font-light text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
          >
            {{ t('btnPrinters') }}
          </a>
          <RouterLink
            v-else
            to="/#printers"
            class="text-lg font-light text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
          >
            {{ t('btnPrinters') }}
          </RouterLink>
          <RouterLink
            v-if="randomPrinter"
            :to="`/printing/${encodeURIComponent(randomPrinter.printerId)}`"
            class="text-lg font-light text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
          >
            {{ t('btnStart') }}
          </RouterLink>
          <RouterLink
            to="/models"
            class="text-lg font-light text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
          >
            {{ t('btnModels') }}
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <LanguageSwitch />
        <ThemeSwitch />
      </div>
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "btnPrinters": "Printers",
    "btnStart": "Start printing",
    "btnModels": "Models"
  },
  "hr": {
    "btnPrinters": "Printeri",
    "btnStart": "Kreni printati",
    "btnModels": "Modeli"
  },
  "it": {
    "btnPrinters": "Stampanti",
    "btnStart": "Avvia stampa",
    "btnModels": "Modelli"
  }
}
</i18n>
