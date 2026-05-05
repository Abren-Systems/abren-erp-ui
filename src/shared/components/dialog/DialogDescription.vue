<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui'
import { cn } from '@/shared/utils'

const props = defineProps<DialogDescriptionProps & { class?: string }>()
</script>

<template>
  <DialogDescription v-bind="props" :class="cn('text-sm text-neutral-500', props.class)">
    <slot />
  </DialogDescription>
</template>
