<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastProvider from '@/platform/feedback/ToastProvider.vue'
import DevToolsDrawer from '@/platform/debug/devtools/DevToolsDrawer.vue'

const isDev = import.meta.env.DEV
</script>

<template>
  <RouterView />
  <ToastProvider />
  <DevToolsDrawer v-if="isDev" />
</template>
