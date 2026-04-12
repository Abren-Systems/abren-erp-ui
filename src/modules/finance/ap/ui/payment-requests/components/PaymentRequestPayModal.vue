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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'

/**
 * ActionModal — Execute Payment.
 * Requires payment method and disbursement reference before confirming.
 */

defineProps<{
  open: boolean
  totalAmount: string
  isPending: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'confirm', data: { payment_method: string; disbursement_reference: string }): void
}>()

const paymentMethod = ref('BANK_TRANSFER')
const disbursementRef = ref('')

function handleConfirm() {
  if (!disbursementRef.value.trim()) return
  emit('confirm', {
    payment_method: paymentMethod.value,
    disbursement_reference: disbursementRef.value.trim(),
  })
  disbursementRef.value = ''
}

function handleCancel() {
  disbursementRef.value = ''
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Execute Payment</DialogTitle>
        <DialogDescription>
          Record disbursement details for
          <span class="font-semibold">{{ totalAmount }}</span>.
          This will create a journal entry in the General Ledger.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="grid gap-2">
          <Label for="payment-method">Payment Method</Label>
          <Select v-model="paymentMethod">
            <SelectTrigger id="payment-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="CHECK">Cheque</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label for="disbursement-ref">
            Reference / Transaction # <span class="text-destructive">*</span>
          </Label>
          <Input
            id="disbursement-ref"
            v-model="disbursementRef"
            placeholder="e.g. TRX-2026-0411-001"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button
          :disabled="!disbursementRef.trim() || isPending"
          @click="handleConfirm"
        >
          {{ isPending ? 'Processing…' : 'Confirm Payment' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
