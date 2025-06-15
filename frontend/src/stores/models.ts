import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ModelsResponse } from '@/scripts/types.ts';

export const useModelStore = defineStore('models', () => {
  const models = ref<ModelsResponse>({});
  const isLoading = ref(false);

  function getModels() {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;

    fetch(`/api/models`)
      .then((response) => response.json())
      .then((foundModels) => (models.value = foundModels))
      .finally(() => (isLoading.value = false));
  }

  getModels();

  return { models, isLoading, getModels };
});
