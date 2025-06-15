<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { ref } from 'vue';
  import { useModelStore } from '@/stores/models.ts';
  import UploadIcon from '@/components/icons/UploadIcon.vue';
  import CubeIcon from '@/components/icons/CubeIcon.vue';

  const { t } = useI18n();
  const fileSize = ref('');
  const isDragging = ref(false);
  const inputRef = ref<HTMLInputElement | null>(null);

  function calculateFileSize(bytes: number) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

    if (bytes === 0) {
      return '0 bytes';
    }

    const index = Math.min(Math.floor(Math.log2(bytes) / 10), units.length - 1);

    return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
  }

  function handleFileUpload(file: File) {
    fileSize.value = calculateFileSize(file.size);

    const body = new FormData();

    body.append('files', file);

    fetch('/api/models', { method: 'POST', body }).then(async (response) => {
      if (!response.ok) {
        alert(t('fileFailedToUpload', { error: await response.text() }));
      }
    });
  }

  function handleManualFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      handleFileUpload(input.files[0]);
    }
  }

  function handleDropFileUpload(event: DragEvent) {
    isDragging.value = false;

    if (event.dataTransfer?.files.length) {
      [...event.dataTransfer.files].forEach(handleFileUpload);
    }
  }

  function triggerFileInput() {
    inputRef.value?.click(); // 🔹 Programmatically trigger file input
  }
</script>

<template>
  <div
    class="text-center bg-zinc-200 dark:bg-zinc-900 px-6 py-6 rounded-3xl flex flex-col items-center transition-all"
    :class="{ 'bg-cyan-100 dark:bg-cyan-900': isDragging }"
    @drop.prevent="handleDropFileUpload"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
  >
    <label
      for="gcode-upload"
      class="text-zinc-800 dark:text-zinc-200 text-lg font-semibold mb-4 cursor-pointer"
    >
      {{ t('newModel') }}
    </label>

    <CubeIcon height="60" class="fill-zinc-400 mb-4" />

    <button
      @click="triggerFileInput"
      class="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition"
    >
      <UploadIcon class="w-6 h-6 fill-white" />
      <span>{{ t('selectFile') }}</span>
    </button>

    <input
      ref="inputRef"
      type="file"
      accept=".gcode"
      id="gcode-upload"
      class="hidden"
      @change="handleManualFileUpload"
    />

    <p v-if="fileSize" class="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
      {{ t('fileSize') }}: {{ fileSize }}
    </p>
    <p class="mt-4 text-zinc-600 dark:text-zinc-200" v-html="t('newModelDetails')" />
    <span class="text-zinc-700 dark:text-zinc-400" v-html="t('acceptableFiles')" />
  </div>
</template>

<i18n>
{
  "en": {
    "acceptableFiles": "We accept <span class=\"font-mono\">.gcode</span> files only.",
    "fileFailedToUpload": "Failed to upload the file. Error: {error}",
    "fileSize": "File size",
    "selectFile": "Select File",
    "newModel": "Upload a new model",
    "newModelDetails": "Save a new model in the application for printing on all printers."
  },
  "hr": {
    "acceptableFiles": "Prihvaćamo samo <span class=\"font-mono\">.gcode</span> datoteke.",
    "fileFailedToUpload": "Neuspješno učitavanje datoteke. Pogreška: {error}",
    "fileSize": "Veličina datoteke",
    "selectFile": "Odaberi datoteku",
    "newModel": "Učitajte novi model",
    "newModelDetails": "Spremite novi model u aplikaciju za ispis na svim pisačima."
  },
  "it": {
    "acceptableFiles": "Accettiamo solo file <span class=\"font-mono\">.gcode</span>.",
    "fileFailedToUpload": "Caricamento del file non riuscito. Errore: {error}",
    "fileSize": "Dimensione del file",
    "selectFile": "Seleziona file",
    "newModel": "Carica un nuovo modello",
    "newModelDetails": "Salva un nuovo modello nell'app per la stampa su tutte le stampanti."
  }
}
</i18n>
