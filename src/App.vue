<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastProvider from '@/platform/feedback/ToastProvider.vue'
</script>

<template>
  <RouterView />
  <ToastProvider />
</template>
