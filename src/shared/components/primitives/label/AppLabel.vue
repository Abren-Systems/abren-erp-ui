<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/shared/utils'

defineOptions({ inheritAttrs: false })

interface Props {
  for?: string
}

const props = defineProps<Props>()
const attrs = useAttrs()

const labelClass = computed(() =>
  cn(
    'text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    attrs.class,
  ),
)
</script>

<template>
  <label :for="props.for" :class="labelClass" v-bind="attrs">
    <slot />
  </label>
</template>
