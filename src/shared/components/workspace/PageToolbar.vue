<script setup lang="ts">
import { cn } from '@/shared/lib'

interface Props {
  class?: string
}

defineProps<Props>()
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-4 py-3 shadow-sm',
        $props.class,
      )
    "
  >
    <div class="flex flex-1 flex-wrap items-center gap-3">
      <slot />
    </div>

    <div v-if="$slots['actions']" class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
