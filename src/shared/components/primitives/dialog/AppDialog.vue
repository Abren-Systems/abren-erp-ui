<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog'

interface Props {
  open: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  size: 'md',
})

const emit = defineEmits(['update:open', 'close'])

const sizeClasses = {
  sm: 'sm:max-w-[425px]',
  md: 'sm:max-w-[550px]',
  lg: 'sm:max-w-[700px]',
  xl: 'sm:max-w-[900px]',
} as const

function handleOpenChange(nextOpen: boolean) {
  emit('update:open', nextOpen)
  if (!nextOpen) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent :class="sizeClasses[size]">
      <DialogHeader v-if="title || description">
        <DialogTitle v-if="title">{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <slot />
      </div>

      <DialogFooter v-if="$slots['footer']">
        <slot name="footer" />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
