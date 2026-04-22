<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppInput, AppSelect } from '@/shared/components/primitives'
import { WalletCards, Hash, CheckCircle2 } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog'

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
    <DialogContent class="sm:max-w-[425px] rounded-sm p-0 overflow-hidden border-0 shadow-2xl">
      <DialogHeader class="p-6 bg-[var(--color-neutral-50)] border-b">
        <div class="flex items-center gap-4">
          <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
            <WalletCards class="h-5 w-5 text-[var(--color-primary-600)]" />
          </div>
          <div>
            <DialogTitle
              class="text-[var(--color-neutral-900)] font-bold uppercase tracking-widest text-xs"
              >Execute Payment</DialogTitle
            >
            <DialogDescription class="text-sm text-[var(--color-neutral-600)] mt-2">
              Record disbursement details for
              <span class="font-bold text-[var(--color-neutral-900)]">{{ totalAmount }}</span
              >.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="p-6 space-y-6">
        <AppSelect
          label="Payment Instrument"
          v-model="paymentMethod"
          :options="[
            { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
            { label: 'Cheque / Draft', value: 'CHECK' },
            { label: 'Cash Disbursement', value: 'CASH' },
          ]"
          required
        />

        <AppInput
          label="Reference / Transaction #"
          v-model="disbursementRef"
          placeholder="e.g. TRX-2026-0411-001"
          required
          description="Mandatory bank or internal reference number."
        />
      </div>

      <DialogFooter class="p-6 bg-[var(--color-neutral-50)] border-t">
        <AppButton variant="outline" @click="handleCancel">Cancel</AppButton>
        <AppButton
          variant="primary"
          :disabled="!disbursementRef.trim() || isPending"
          @click="handleConfirm"
        >
          <CheckCircle2 v-if="!isPending" :size="14" class="mr-2" />
          {{ isPending ? 'Processing...' : 'Confirm Disbursement' }}
        </AppButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
