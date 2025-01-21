<script setup lang="ts">
  import { useModelStore } from '@/stores/models.ts';
  import { useI18n } from 'vue-i18n';
  import EmptyState from '@/components/EmptyState.vue';
  import RefreshButton from '@/components/RefreshButton.vue';

  const { t } = useI18n();
  const store = useModelStore();
</script>

<template>
  <main class="w-full px-4 gap-16 mt-10 flex justify-center">
    <div class="w-full max-w-screen-2xl flex flex-col max-lg:flex-col gap-y-10">
      <ul v-if="Object.keys(store.models).length" class="flex flex-col gap-3">
        <li v-for="model in store.models" :key="model.displayName">
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
      <template v-else>
        <div class="text-center w-full">
          <EmptyState
            header-locale-key="modelsNotFound"
            description-locale-key="modelsNotFoundDetails"
          />
        </div>
      </template>
      <div class="flex justify-center">
        <RefreshButton @click="store.getModels()" :is-loading="store.isLoading" />
      </div>
    </div>
  </main>
</template>

<i18n>
{
  "en": {
    "modelsNotFound": "No models found",
    "modelsNotFoundDetails": "Upload a new model to have it show up in this list.",
    "uploaded": "Uploaded",
    "bytes": "bytes"
  },
  "hr": {
    "modelsNotFound": "Modeli nisu pronađeni",
    "modelsNotFoundDetails": "Prenesite novi model kako bi se prikazao na ovom popisu.",
    "uploaded": "Dodan",
    "bytes": "bajtova"
  },
  "it": {
    "modelsNotFound": "Nessun modello trovato",
    "modelsNotFoundDetails": "Carica un nuovo modello per farlo apparire in questo elenco.",
    "uploaded": "Caricato",
    "bytes": "byte"
  }
}
</i18n>
