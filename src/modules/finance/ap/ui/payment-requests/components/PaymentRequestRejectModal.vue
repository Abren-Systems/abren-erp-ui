<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
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
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="text-destructive">Reject Payment Request</DialogTitle>
        <DialogDescription>
          This action cannot be undone. The requester will be notified.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2 py-4">
        <Label for="reject-reason"> Reason <span class="text-destructive">*</span> </Label>
        <textarea
          id="reject-reason"
          v-model="reason"
          class="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows="3"
          placeholder="Provide a clear reason (min. 5 characters)…"
        />
        <p class="text-xs text-neutral-500">
          This reason will be permanently attached to the audit trail.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button
          variant="destructive"
          :disabled="reason.trim().length < 5 || isPending"
          @click="handleConfirm"
        >
          {{ isPending ? 'Rejecting…' : 'Confirm Rejection' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
