import type { ModelResponse } from '@/scripts/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModelStore = defineStore('models', () => {
  const models = ref<ModelResponse[]>([]);
  const isLoading = ref(true);

  fetch(`/api/models`)
    .then((response) => response.json())
    .then((foundModels: ModelResponse[]) => (models.value = foundModels))
    .finally(() => (isLoading.value = false));

  return { models, isLoading };
});
