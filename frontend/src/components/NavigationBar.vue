<script setup lang="ts">
  import ThemeSwitch from '@/components/ThemeSwitch.vue';
  import LanguageSwitch from '@/components/LanguageSwitch.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
</script>

<template>
  <div
    role="banner"
    class="bg-white dark:bg-zinc-900 w-full flex justify-center shadow-md py-2 px-4 text-sm mb-4"
  >
    <div class="max-w-screen-2xl w-full flex flex-wrap justify-between items-center gap-3">
      <div class="flex items-center">
        <RouterLink v-if="route.path != '/'" to="/"
                    class="text-lg text-zinc-500 dark:text-zinc-200 hover:bg-zinc-100 hover:dark:bg-zinc-700 rounded-xl px-2 py-1">
          <span class="text-cyan-500">❬</span>
          <span class="font-light"> Printers</span>
        </RouterLink>
      </div>
      <div class="flex items-center">
        <LanguageSwitch />
        <ThemeSwitch />
      </div>
    </div>
  </div>
</template>
