<script setup lang="ts">
  const languages: Record<string, string> = {
    'en-us': 'English',
    'hr-hr': 'Hrvatski',
    'it': 'Italiano'
  };
</script>

<template>
  <select
    class="bg-transparent text-lg font-light text-zinc-800 dark:text-zinc-200 rounded-xl cursor-pointer"
    title="Select the display language">
    <option v-for="[value, text] in Object.entries(languages)" :value="value" :key="value" class="dark:bg-zinc-800 border-0">{{ text }}</option>
  </select>
</template>
