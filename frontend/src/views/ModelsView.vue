<script setup lang="ts">
  import { useModelStore } from '@/stores/models.ts';
</script>

<template>
  <main class="w-full px-4 gap-16 mt-10 flex justify-center">
    <div class="w-full max-w-screen-2xl flex max-lg:flex-col gap-y-10">
      <ul class="flex flex-col gap-3">
        <li v-for="model in useModelStore().models" :key="model.displayName">
          <div class="bg-zinc-200 dark:bg-zinc-900 px-4 py-3 rounded-lg">
            <h4 class="text-xl text-zinc-900 dark:text-zinc-100" contenteditable>
              {{ model.displayName }}
            </h4>
            <p v-if="model.size" class="text-zinc-700 dark:text-zinc-400">{{ model.size }} bytes</p>
            <p v-if="model.creationTimestamp" class="text-zinc-700 dark:text-zinc-400">
              Uploaded {{ new Date(model.creationTimestamp).toLocaleString() }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>
