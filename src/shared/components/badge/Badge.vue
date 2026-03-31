<script setup lang="ts">
import { badgeVariants, type BadgeVariants } from './index'
import { cn } from '@/shared/utils/cn'

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
