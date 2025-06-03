<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  defineProps<{
    headerLocaleKey: string;
    descriptionLocaleKey: string;
  }>();

  const { t } = useI18n({ useScope: 'parent' });
</script>

<template>
  <div class="flex flex-col items-center">
    <h3 class="text-2xl font-semibold text-zinc-400 text-center">{{ t(headerLocaleKey) }}</h3>
    <p class="text-zinc-500 mt-2 text-center">
      {{ t(descriptionLocaleKey) }}
    </p>
  </div>
</template>
