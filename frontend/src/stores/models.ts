import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ModelsResponse } from '@shared-types/data-transfer-objects.ts';

export const useModelStore = defineStore('models', () => {
  const models = ref<ModelsResponse>({});
  const isLoading = ref(false);

  function getModels() {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;

    fetch(`http://localhost:3000/api/model`)
      .then((response) => response.json())
      .then((foundModels) => (models.value = foundModels))
      .finally(() => (isLoading.value = false));
  }

  getModels();

  return { models, isLoading, getModels };
});
