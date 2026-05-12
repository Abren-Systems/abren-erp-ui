<script setup lang="ts">
/**
 * Single canonical bounds for module routes (hub workspace + ScreenRenderer + legacy pages).
 * Aligns max width and horizontal rhythm with Acumatica-style “working area” (dense, bounded column).
 */
defineOptions({ name: 'AppWorkingArea' })
</script>

<template>
  <div
    class="app-working-area mx-auto w-full min-w-0 max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
  >
    <slot />
  </div>
</template>
