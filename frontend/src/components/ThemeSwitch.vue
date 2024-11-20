<script setup lang="ts">
  import MoonIcon from './icons/MoonIcon.vue';
  import SunIcon from './icons/SunIcon.vue';
  import useGlobalStore from '@/stores/global';

  const store = useGlobalStore();
</script>

<template>
  <button @click="store.toggleTheme" class="hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full p-1" title="Toggle between light and dark mode">
    <MoonIcon
      v-if="store.isDarkTheme()"
      width="1.6em"
      height="1.6em"
      class="fill-zinc-200"
    />
    <SunIcon
      v-else
      width="1.6em"
      height="1.6em"
      class="fill-zinc-800"
    />
  </button>
</template>
