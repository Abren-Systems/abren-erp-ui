<script setup lang="ts">
import { cn } from '@/shared/utils'

interface CardTitleProps {
  class?: string
}

defineProps<CardTitleProps>()
</script>

<template>
  <h3 :class="cn('text-lg font-semibold leading-none tracking-tight', $props.class)">
    <slot />
  </h3>
</template>
