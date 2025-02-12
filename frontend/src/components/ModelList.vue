<script setup lang="ts">
  import EmptyState from '@/components/EmptyState.vue';
  import TrashIcon from '@/components/icons/TrashIcon.vue';
  import DownloadIcon from '@/components/icons/DownloadIcon.vue';
  import { useModelStore } from '@/stores/models.ts';
  import { useI18n } from 'vue-i18n';
  import { ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';

  const { t } = useI18n();
  const { models } = storeToRefs(useModelStore());

  const editableNames = ref<Record<string, string>>({});

  watch(
    models,
    (newModels) => {
      editableNames.value = Object.fromEntries(
        Object.entries(newModels).map(([id, model]) => [id, model.displayName]),
      );
    },
    { deep: true, immediate: true },
  );

  function editModelDisplayName(modelId: string) {
    const newName = editableNames.value[modelId];

    if (newName === models.value[modelId]?.displayName) {
      return;
    }

    fetch(`http://localhost:3000/api/model/${encodeURIComponent(modelId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: newName }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      if (response.ok) {
        models.value[modelId].displayName = newName;
      } else {
        editableNames.value[modelId] = models.value[modelId]?.displayName;
        response.text().then(alert);
      }
    });
  }

  function deleteModel(modelId: string) {
    if (
      !confirm(
        t('confirmDeleteModel', { displayName: models.value[modelId]?.displayName ?? 'Unknown' }),
      )
    ) {
      return;
    }

    fetch(`http://localhost:3000/api/model/${encodeURIComponent(modelId)}`, {
      method: 'DELETE',
    }).then(async (response) => {
      if (response.ok) {
        return delete models.value[modelId];
      }

      alert(`Error: ${await response.text()}`);
    });
  }
</script>

<template>
  <div>
    <template v-if="Object.keys(models).length">
      <h3 class="text-center mb-4 text-xl font-semibold">{{ t('modelsTitle') }}</h3>
      <ul class="flex flex-col gap-3">
        <li v-for="[id, model] in Object.entries(models)" :key="model.displayName">
          <div class="bg-zinc-200 dark:bg-zinc-900 px-4 py-3 rounded-lg flex">
            <div class="flex-1">
              <h4
                class="text-xl text-zinc-900 dark:text-zinc-100 mb-2"
                title="Click to edit, unfocus to save"
                @input="({ target }) => (editableNames[id] = (target as any).innerText)"
                @blur="editModelDisplayName(id)"
                contenteditable
              >
                {{ editableNames[id] }}
              </h4>
              <p class="text-zinc-600 dark:text-zinc-500">
                {{ `${model.size} ${t('bytes')}` }}
              </p>
              <p v-if="model.creationTimestamp" class="text-zinc-600 dark:text-zinc-500">
                {{ `${t('uploaded')} ${new Date(model.creationTimestamp).toLocaleString()}` }}
              </p>
            </div>
            <a
              :href="`http://localhost:3000/api/model/${encodeURIComponent(id)}/download`"
              :download="editableNames[id]"
              class="hover:bg-gray-300 dark:hover:bg-zinc-800 rounded-full self-center"
              :title="t('downloadModelTitle')"
            >
              <DownloadIcon class="fill-cyan-500 m-2" />
            </a>
            <button
              class="hover:bg-gray-300 dark:hover:bg-zinc-800 rounded-full self-center"
              @click="deleteModel(id)"
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
    "bytes": "bytes",
    "confirmDeleteModel": "Are you sure you want to delete {displayName}?",
    "modelsNotFound": "No models found",
    "modelsNotFoundDetails": "Upload a new model to see it in this list.",
    "modelsTitle": "Stored models",
    "uploaded": "Uploaded",
    "downloadModelTitle": "Click to download the model file",
    "deleteModelTitle": "Click to delete the model"
  },
  "hr": {
    "bytes": "bajtova",
    "confirmDeleteModel": "Jeste li sigurni da želite izbrisati {displayName}?",
    "modelsNotFound": "Modeli nisu pronađeni",
    "modelsNotFoundDetails": "Prenesite novi model kako biste ga vidjeli na ovom popisu.",
    "modelsTitle": "Spremljeni modeli",
    "uploaded": "Dodan",
    "downloadModelTitle": "Preuzmite datoteku modela",
    "deleteModelTitle": "Izbrišite model"
  },
  "it": {
    "bytes": "byte",
    "modelsNotFound": "Nessun modello trovato",
    "modelsNotFoundDetails": "Carica un nuovo modello per farlo apparire in questo elenco.",
    "uploaded": "Caricato",
    "downloadModelTitle": "Clicca per scaricare il file del modello",
    "deleteModelTitle": "Clicca per eliminare il modello"
  }
}
</i18n>
