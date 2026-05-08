<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './'
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  placeholder?: string
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'update:modelValue', value: string): void
  (e: 'confirm'): void
}>()

const internalReason = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    internalReason.value = newVal
  },
)

const handleConfirm = () => {
  if (!internalReason.value.trim()) return
  emit('update:modelValue', internalReason.value)
  emit('confirm')
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <textarea
          v-model="internalReason"
          :placeholder="placeholder || 'Enter reason here...'"
          class="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
        />
      </div>

      <DialogFooter>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
          @click="handleCancel"
        >
          {{ cancelLabel || 'Cancel' }}
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2"
          :disabled="!internalReason.trim()"
          @click="handleConfirm"
        >
          {{ confirmLabel || 'Confirm' }}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
