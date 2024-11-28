import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useModelStore = defineStore('models', () => {
  const models = reactive([
    {
      value: 'cube',
      text: 'Calibration Cube'
    },
    {
      value: 'vase',
      text: 'Spiral Vase'
    },
    {
      value: 'benchy',
      text: '3DBenchy'
    },
    {
      value: 'gear',
      text: 'Mechanical Gear'
    },
    {
      value: 'figure',
      text: 'Artistic Figure'
    },
    {
      value: 'plastic-cup',
      text: 'Plastic Cup'
    }
  ]);

  return { models };
});
