<script setup lang="ts">
  import { useModelStore } from '@/stores/models.ts';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>

<template>
  <main class="w-full px-4 gap-16 mt-10 flex justify-center">
    <div class="w-full max-w-screen-2xl flex max-lg:flex-col gap-y-10">
      <ul class="flex flex-col gap-3">
        <li v-for="model in useModelStore().models" :key="model.displayName">
          <div class="bg-zinc-200 dark:bg-zinc-900 px-4 py-3 rounded-lg">
            <h4
              class="text-xl text-zinc-900 dark:text-zinc-100"
              title="Click to edit, unfocus to save"
              contenteditable
            >
              {{ model.displayName }}
            </h4>
            <p v-if="model.size" class="text-zinc-700 dark:text-zinc-400">
              {{ `${model.size} ${t('bytes')}` }}
            </p>
            <p v-if="model.creationTimestamp" class="text-zinc-700 dark:text-zinc-400">
              {{ `${t('uploaded')} ${new Date(model.creationTimestamp).toLocaleString()}` }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>

<i18n>
{
  "en": {
    "uploaded": "Uploaded",
    "bytes": "bytes"
  },
  "hr": {
    "uploaded": "Dodan",
    "bytes": "bajtova"
  },
  "it": {
    "uploaded": "Caricato",
    "bytes": "byte"
  }
}
</i18n>
