<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { availableLocales } from '@/scripts/translation.ts';
  import { watch } from 'vue';

  const { locale } = useI18n();

  watch(locale, (current) => localStorage.setItem('locale', current));
</script>

<template>
  <select
    class="bg-transparent text-lg font-light text-zinc-800 dark:text-zinc-200 rounded-xl cursor-pointer"
    title="Select the display language"
    v-model="locale"
  >
    <option
      v-for="[value, name] in availableLocales"
      :value="value"
      :key="value"
      class="dark:bg-zinc-800 border-0"
    >
      {{ name }}
    </option>
  </select>
</template>
