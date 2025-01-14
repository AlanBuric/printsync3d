import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ModelsResponse } from '@shared-types/data-transfer-objects.ts';

export const useModelStore = defineStore('models', () => {
  const models = ref<ModelsResponse>({});

  function getModels() {
    fetch(`http://localhost:3000/api/model`)
      .then((response) => response.json())
      .then((foundModels) => (models.value = foundModels));
  }

  getModels();

  return { models, getModels };
});
