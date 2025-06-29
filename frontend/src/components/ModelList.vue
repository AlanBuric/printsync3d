<script setup lang="ts">
  import EmptyState from '@/components/EmptyState.vue';
  import TrashIcon from '@/components/icons/TrashIcon.vue';
  import DownloadIcon from '@/components/icons/DownloadIcon.vue';
  import { useModelStore } from '@/stores/models.ts';
  import { useI18n } from 'vue-i18n';
  import { storeToRefs } from 'pinia';
  import { useUIEdit } from '@/composables/useInputEdit';
  import type { ModelResponse } from '@/scripts/types';
  import { ref } from 'vue';

  const { t } = useI18n();
  const { models } = storeToRefs(useModelStore());
  const currentModelBeingEdited = ref<ModelResponse | null>(null);

  function submitNewDisplayName(newName: string) {
    if (currentModelBeingEdited.value == null) return;

    const model = currentModelBeingEdited.value;

    fetch(`/api/models/${encodeURIComponent(model.modelId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: newName }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      if (response.ok) {
        model.displayName = newName;
      } else {
        response.text().then(alert);
      }
    });

    if (model.modelId == currentModelBeingEdited.value?.modelId)
      currentModelBeingEdited.value = null;
  }

  function overridenStartEditing(model: ModelResponse) {
    currentModelBeingEdited.value = model;
    startEditing();
  }

  const { isEditing, inputRef, startEditing, onInputKeydown, onSubmit, value } = useUIEdit(
    () => currentModelBeingEdited.value?.displayName,
    submitNewDisplayName,
  );

  function deleteModel(model: ModelResponse) {
    if (!confirm(t('confirmDeleteModel', { displayName: model.displayName }))) return;

    fetch(`/api/models/${encodeURIComponent(model.modelId)}`, {
      method: 'DELETE',
    }).then(async (response) => {
      if (!response.ok) alert(`Error: ${await response.text()}`);
    });
  }

  /**
   * Formats a file size in bytes to a string with the nearest magnitude suffix.
   * For example:
   *   800        -> "800 B"
   *   2048       -> "2 KB"
   *   3145728    -> "3 MB"
   */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];

    let i = 0;
    let size = bytes;

    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }

    return `${parseFloat(size.toFixed(2))} ${units[i]}`;
  }
</script>

<template>
  <div>
    <template v-if="Object.keys(models).length">
      <h3 class="text-center mb-4 text-xl font-semibold">{{ t('modelsTitle') }}</h3>
      <ul class="flex flex-col gap-3">
        <li v-for="model in models" :key="model.displayName">
          <div class="bg-zinc-200 dark:bg-zinc-900 px-4 py-3 rounded-lg flex">
            <div class="flex-1">
              <input
                v-if="isEditing && currentModelBeingEdited?.modelId == model.modelId"
                ref="inputRef"
                v-model.trim="value"
                @blur="onSubmit"
                @keydown="onInputKeydown"
                class="min-w-10 text-xl text-zinc-900 dark:text-zinc-100 px-0 py-0 bg-transparent border-none outline-none"
              />
              <div v-else class="flex gap-2 mb-2">
                <h4 class="text-xl text-zinc-900 dark:text-zinc-100">
                  {{ model.displayName }}
                </h4>
                <button
                  class="text-xs text-zinc-500 hover:underline bg-none cursor-pointer border-none"
                  @click="overridenStartEditing(model)"
                >
                  {{ t('editAction') }}
                </button>
              </div>
              <div class="flex gap-x-2 text-zinc-600 dark:text-zinc-500">
                <span>
                  {{ formatFileSize(model.size) }}
                </span>
                <span>|</span>
                <span v-if="model.creationTimestamp">
                  {{ `${t('uploaded')} ${new Date(model.creationTimestamp).toLocaleString()}` }}
                </span>
              </div>
            </div>
            <a
              :href="`/api/models/${encodeURIComponent(model.modelId)}/download`"
              :download="model.displayName"
              class="hover:bg-gray-300 dark:hover:bg-zinc-800 rounded-full self-center"
              :title="t('downloadModelTitle')"
            >
              <DownloadIcon class="fill-cyan-500 m-2" />
            </a>
            <button
              class="hover:bg-gray-300 dark:hover:bg-zinc-800 rounded-full self-center"
              @click="deleteModel(model)"
              :title="t('deleteModelTitle')"
            >
              <TrashIcon class="fill-cyan-500 m-2" />
            </button>
          </div>
        </li>
      </ul>
    </template>
    <div v-else class="text-center w-full">
      <EmptyState
        header-locale-key="modelsNotFound"
        description-locale-key="modelsNotFoundDetails"
      />
    </div>
  </div>
</template>

<i18n>
{
  "en": {
    "confirmDeleteModel": "Are you sure you want to delete {displayName}?",
    "modelsNotFound": "No models found",
    "modelsNotFoundDetails": "Upload a new model to see it in this list.",
    "modelsTitle": "Uploaded models",
    "uploaded": "Uploaded",
    "downloadModelTitle": "Click to download the model file",
    "deleteModelTitle": "Click to delete the model"
  },
  "hr": {
    "confirmDeleteModel": "Jeste li sigurni da želite izbrisati {displayName}?",
    "modelsNotFound": "Modeli nisu pronađeni",
    "modelsNotFoundDetails": "Prenesite novi model kako biste ga vidjeli na ovom popisu.",
    "modelsTitle": "Učitani modeli",
    "uploaded": "Dodan",
    "downloadModelTitle": "Preuzmite datoteku modela",
    "deleteModelTitle": "Izbrišite model"
  },
  "it": {
    "confirmDeleteModel": "Sei sicuro di voler eliminare {displayName}?",
    "modelsNotFound": "Nessun modello trovato",
    "modelsNotFoundDetails": "Carica un nuovo modello per farlo apparire in questo elenco.",
    "modelsTitle": "Modelli caricati",
    "uploaded": "Caricato",
    "downloadModelTitle": "Clicca per scaricare il file del modello",
    "deleteModelTitle": "Clicca per eliminare il modello"
  }
}
</i18n>
