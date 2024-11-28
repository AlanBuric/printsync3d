<script setup lang="ts">

  import useGlobalStore from '@/stores/global';
  import PrinterList from '@/components/PrinterList.vue';
</script>

<template>
  <main class="w-full flex items-center flex-col">
    <header>
      <img v-if="useGlobalStore().isDarkTheme()" alt="PrintSync3D logo" src="../assets/images/logo-dark-mode.png"
           width="200px" height="200px" class="pointer-events-none select-none" />
      <img v-else alt="PrintSync3D logo" src="../assets/images/logo-light-mode.png" width="200px" height="200px"
           class="pointer-events-none select-none" />
    </header>
    <PrinterList />
  </main>
</template>
