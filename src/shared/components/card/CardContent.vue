<script setup lang="ts">
import { cn } from '@/shared/utils'

interface CardContentProps {
  class?: string
}

defineProps<CardContentProps>()
</script>

<template>
  <div :class="cn('p-6 pt-0', $props.class)">
    <slot />
  </div>
</template>
