<script setup lang="ts">
  import useGlobalStore from '@/stores/global';
  import PrinterList from '@/components/PrinterList.vue';
</script>

<template>
  <main class="w-full flex items-center flex-col min-h-screen px-1 py-8">
    <header class="flex justify-center items-center mb-8">
      <img
        v-if="useGlobalStore().isDarkTheme()"
        alt="Dark Mode Logo"
        src="../assets/images/light-logo-new.png"
        width="1200"
        class="pointer-events-none select-none"
      />
      <img
        v-else
        alt="Light Mode Logo"
        src="../assets/images/dark-logo-new.png"
        width="1200"
        class="pointer-events-none select-none"
      />
    </header>
    <div class="w-full flex items-center flex-col">
      <div class="max-w-screen-xl">
        <PrinterList />
      </div>
    </div>
  </main>
</template>
