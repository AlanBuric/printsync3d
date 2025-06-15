import type { Model, ModelResponse } from '@/scripts/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export function mapModelResponse(model: ModelResponse): Model {
  return { ...model, editableName: model.displayName };
}

export const useModelStore = defineStore('models', () => {
  const models = ref<Model[]>([]);
  const isLoading = ref(true);

  fetch(`/api/models`)
    .then((response) => response.json())
    .then((foundModels: ModelResponse[]) => (models.value = foundModels.map(mapModelResponse)))
    .finally(() => (isLoading.value = false));

  return { models, isLoading };
});
