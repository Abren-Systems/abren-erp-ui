<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppInput } from '@/shared/components/primitives'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog'

/**
 * ActionModal — Reject Payment Request.
 * Interruptive confirmation with mandatory reason field.
 */

defineProps<{
  open: boolean
  isPending: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')

function handleConfirm() {
  if (reason.value.trim().length < 5) return
  emit('confirm', reason.value.trim())
  reason.value = ''
}

function handleCancel() {
  reason.value = ''
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px] rounded-sm p-0 overflow-hidden border-0 shadow-2xl">
      <DialogHeader class="p-6 bg-[var(--color-neutral-50)] border-b">
        <DialogTitle class="text-[var(--color-danger-600)] font-bold uppercase tracking-widest text-xs">Reject Payment Request</DialogTitle>
        <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
          This action cannot be undone. The requester will be notified and this will be logged.
        </DialogDescription>
      </DialogHeader>

      <div class="p-6 space-y-4">
        <div class="space-y-1.5">
          <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]">Rejection Reason *</label>
          <textarea
            id="reject-reason"
            v-model="reason"
            class="w-full resize-none rounded-sm border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/50 px-3 py-2 text-sm focus:bg-white focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] outline-none transition-colors"
            rows="3"
            placeholder="Provide a clear reason (min. 5 characters)..."
          />
          <p class="text-[10px] text-[var(--color-neutral-400)]">
            This reason will be permanently attached to the audit trail.
          </p>
        </div>
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)] border-t">
        <AppButton variant="outline" @click="handleCancel">Cancel</AppButton>
        <AppButton
          variant="danger"
          :disabled="reason.trim().length < 5 || isPending"
          @click="handleConfirm"
        >
          {{ isPending ? 'Rejecting...' : 'Confirm Rejection' }}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
