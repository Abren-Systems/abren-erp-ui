<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps, useForwardProps } from 'radix-vue'
import { cn } from '@/shared/lib/cn'

const props = defineProps<DialogDescriptionProps & { class?: string }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogDescription v-bind="forwarded" :class="cn('text-sm text-neutral-500', props.class)">
    <slot />
  </DialogDescription>
</template>
