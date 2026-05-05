<script setup lang="ts">
import { cn } from '@/shared/utils'

interface CardDescriptionProps {
  class?: string
}

defineProps<CardDescriptionProps>()
</script>

<template>
  <p :class="cn('text-sm text-neutral-500', $props.class)">
    <slot />
  </p>
</template>
