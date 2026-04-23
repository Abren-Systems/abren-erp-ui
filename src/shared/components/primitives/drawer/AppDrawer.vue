<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/sheet'

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
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
} as const

function handleOpenChange(nextOpen: boolean) {
  emit('update:open', nextOpen)
  if (!nextOpen) {
    emit('close')
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="handleOpenChange">
    <SheetContent :class="sizeClasses[size]">
      <SheetHeader class="border-b border-[var(--color-neutral-200)] pb-4 pr-8">
        <SheetTitle v-if="title">{{ title }}</SheetTitle>
        <SheetDescription v-if="description">{{ description }}</SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto pt-6">
        <slot />
      </div>

      <SheetFooter
        v-if="$slots.footer"
        class="border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-0 pt-4"
      >
        <slot name="footer" />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
