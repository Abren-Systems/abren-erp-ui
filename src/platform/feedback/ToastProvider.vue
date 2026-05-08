<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <Toaster 
    position="top-right" 
    rich-colors 
    close-button 
    expand
    :toast-options="{
      style: {
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    }"
  />
</template>

<style scoped>
/* Ensure the toaster is above the application chrome but below high-level modals if needed */
:deep(.sonner-toaster) {
  z-index: 9999;
}
</style>
