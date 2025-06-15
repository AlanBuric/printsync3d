<script setup lang="ts">
  import { useModelStore } from '@/stores/models.ts';
  import ModelList from '@/components/ModelList.vue';
  import ModelUpload from '@/components/ModelUpload.vue';

  const store = useModelStore();
</script>

<template>
  <main class="w-full px-1 py-8 gap-16 flex justify-center">
    <div class="w-full max-w-screen-md flex flex-col max-lg:flex-col gap-y-8">
      <ModelUpload />
      <ModelList />
    </div>
  </main>
</template>
