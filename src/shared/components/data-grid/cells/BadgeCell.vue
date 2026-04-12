<script setup lang="ts">
import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib'

interface BadgeCellProps {
  status: string
  variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'>
  class?: string
}

defineProps<BadgeCellProps>()
</script>

<template>
  <Badge
    :variant="variants[status] || 'outline'"
    :class="cn('uppercase tracking-wider font-semibold px-2', $props.class)"
  >
    {{ status }}
  </Badge>
</template>
