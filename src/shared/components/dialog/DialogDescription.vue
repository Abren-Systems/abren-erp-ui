<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'radix-vue'
import { cn } from '@/shared/utils/cn'

const props = defineProps<DialogDescriptionProps & { class?: string }>()
</script>

<template>
  <DialogDescription v-bind="props" :class="cn('text-sm text-neutral-500', props.class)">
    <slot />
  </DialogDescription>
</template>
