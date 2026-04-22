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
 * ActionModal — Void Journal Entry Confirmation.
 *
 * Stage 4 of Progressive Disclosure: Interruptive, minimal-density
 * confirmation for destructive actions. Requires a mandatory reason
 * field per the UX Architecture mandate.
 */

const props = defineProps<{
  open: boolean
  entryNumber: string
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')

function handleConfirm() {
  if (!reason.value.trim()) return
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
        <DialogTitle
          class="text-[var(--color-danger-600)] font-bold uppercase tracking-widest text-xs"
          >Void Journal Entry</DialogTitle
        >
        <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
          You are about to void
          <span class="font-bold text-[var(--color-neutral-900)]">{{ entryNumber }}</span
          >. This action is irreversible and will be recorded in the audit trail.
        </DialogDescription>
      </DialogHeader>

      <div class="p-6 space-y-4">
        <AppInput
          label="Voiding Reason"
          v-model="reason"
          placeholder="e.g. Duplicate entry, incorrect amount"
          required
          description="This reason will be permanently attached to the audit log."
        />
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)] border-t">
        <AppButton variant="outline" @click="handleCancel">Cancel</AppButton>
        <AppButton variant="danger" :disabled="!reason.trim()" @click="handleConfirm">
          Void Entry
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
