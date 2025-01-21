<script setup lang="ts">
  import LoadingAnimation from '@/components/LoadingAnimation.vue';
  import { useI18n } from 'vue-i18n';

  defineProps<{ isLoading: boolean }>();

  const { t } = useI18n({ useScope: 'parent' });
</script>

<template>
  <button
    class="rounded-full text-xl text-cyan-500 hover:text-cyan-400 bg-zinc-200 dark:bg-zinc-900 hover:dark:bg-zinc-950 hover:bg-gray-200 dark:hover:bg-zinc-800 px-4 py-2"
  >
    <LoadingAnimation class="w-8" v-if="isLoading" />
    <span v-else>{{ '⟳ ' + t('refresh') }}</span>
  </button>
</template>
