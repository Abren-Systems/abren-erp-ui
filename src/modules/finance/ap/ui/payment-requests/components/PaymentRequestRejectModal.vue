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
    <DialogContent class="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border border-[color:var(--color-neutral-200)] shadow-2xl">
      <DialogHeader class="p-6 bg-[var(--color-neutral-50)]/50 border-b border-[color:var(--color-neutral-100)]">
        <DialogTitle
          class="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-danger-600)]"
          >Reject Payment Request</DialogTitle
        >
        <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
          This action cannot be undone. The requester will be notified and this rejection will be logged in the audit trail.
        </DialogDescription>
      </DialogHeader>

      <div class="p-6 space-y-4">
        <AppTextarea
          label="Rejection Reason"
          v-model="reason"
          placeholder="Provide a clear reason for audit traceability..."
          required
          :rows="3"
          description="This reason will be permanently attached to the audit trail."
        />
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)]/50 border-t border-[color:var(--color-neutral-100)]">
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
