<script setup lang="ts">
import { AppCheckbox } from '@/shared/components/primitives'

defineProps<{
  checked: boolean
  indeterminate?: boolean
}>()

defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <AppCheckbox :checked="checked" @update:checked="$emit('update:checked', $event)" @click.stop />
  </div>
</template>
