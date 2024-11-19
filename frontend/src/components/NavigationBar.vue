<script setup lang="ts">
  import ThemeSwitch from '@/components/ThemeSwitch.vue';
  import LanguageSwitch from '@/components/LanguageSwitch.vue';
</script>

<template>
  <div
    role="banner"
    class="bg-zinc-200 dark:bg-zinc-900 w-full flex justify-center shadow-md py-2 px-4 text-sm"
  >
    <div class="max-w-screen-2xl w-full flex flex-wrap justify-end items-center gap-3">
      <LanguageSwitch />
      <ThemeSwitch />
    </div>
  </div>
</template>
