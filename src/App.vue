<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainLayout from './layout/MainLayout.vue'
</script>

<template>
  <MainLayout></MainLayout>
  <div class="h-[calc(100%-7rem)] overflow-y-auto">
    <RouterView />
  </div>
</template>

<style scoped></style>
