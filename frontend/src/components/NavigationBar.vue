<script setup lang="ts">
  import ThemeSwitch from '@/components/ThemeSwitch.vue';
  import LanguageSwitch from '@/components/LanguageSwitch.vue';
  import { useRoute } from 'vue-router';
  import useGlobalStore from '@/stores/global';
  import { usePrinterStore } from '@/stores/printer';
  import { getRandomElement } from '@/scripts/utils';

  const route = useRoute();
  const randomPrinter = getRandomElement(usePrinterStore().printers);
</script>

<template>
  <div
    role="banner"
    class="bg-white dark:bg-zinc-900 w-full flex justify-between items-center shadow-md py-2 px-4 text-sm"
  >
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
        <a v-if="route.path == '/'"
           href="#printers"
           class="flex text-lg font-light text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
        >
          Printers
        </a>
        <RouterLink v-else to="/"
                    class="text-lg font-light text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400">
          Printers
        </RouterLink>
        <RouterLink
          v-if="randomPrinter"
          :to="`/start-printing/${randomPrinter.usb.productId}`"
          class="text-lg font-light text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
        >
          Start Printing
        </RouterLink>
      </nav>
    </div>
    <div class="flex items-center gap-3">
      <LanguageSwitch />
      <ThemeSwitch />
    </div>
  </div>
</template>
