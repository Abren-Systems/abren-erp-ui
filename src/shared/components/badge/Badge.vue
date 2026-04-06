<script setup lang="ts">
/**
 * Design System Badge component.
 *
 * Used for status indicators and small metadata tags.
 *
 * @example
 * <Badge variant="success">Paid</Badge>
 */
import { badgeVariants, type BadgeVariants } from './index'
import { cn } from '@/shared/lib'

interface BadgeProps {
  variant?: BadgeVariants['variant']
  class?: string
}

defineProps<BadgeProps>()
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), $props.class)">
    <slot />
  </div>
</template>
