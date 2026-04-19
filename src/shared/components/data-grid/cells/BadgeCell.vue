<script setup lang="ts">
import { AppBadge } from '@/shared/components/primitives'
import { cn } from '@/shared/lib'

interface BadgeCellProps {
  status: string
  /**
   * Maps status values to AppBadge semantic variants
   */
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
  class?: string
}

defineProps<BadgeCellProps>()
</script>

<template>
  <AppBadge :variant="variant" :class="cn('px-2', $props.class)">
    {{ status }}
  </AppBadge>
</template>
