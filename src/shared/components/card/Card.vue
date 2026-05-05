<script setup lang="ts">
import { cn } from '@/shared/utils'

interface CardProps {
  class?: string
}

defineProps<CardProps>()
</script>

<template>
  <div :class="cn('rounded-xl border border-neutral-200 bg-white shadow-sm', $props.class)">
    <slot />
  </div>
</template>
