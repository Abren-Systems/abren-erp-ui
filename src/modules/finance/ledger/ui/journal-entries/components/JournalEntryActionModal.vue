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
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="text-destructive">Void Journal Entry</DialogTitle>
        <DialogDescription>
          You are about to void
          <span class="font-semibold">{{ entryNumber }}</span
          >. This action is irreversible and will be recorded in the audit trail.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2 py-4">
        <Label for="void-reason"> Reason <span class="text-destructive">*</span> </Label>
        <Input
          id="void-reason"
          v-model="reason"
          placeholder="e.g. Duplicate entry, incorrect amount"
          autocomplete="off"
        />
        <p class="text-xs text-neutral-500">
          This reason will be permanently attached to the audit log.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button variant="destructive" :disabled="!reason.trim()" @click="handleConfirm">
          Void Entry
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
