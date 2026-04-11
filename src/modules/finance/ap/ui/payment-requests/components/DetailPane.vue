<script setup lang="ts">
/**
 * Payment Request Detail Pane (Middle Pane of Split View).
 *
 * Displays the focused entity's metadata and justification.
 * This is a read-only summary pane, not a form.
 */
import type { PaymentRequest } from '../../../domain/ap.types'
import StatusBadge from './StatusBadge.vue'
import { User, Calendar, Banknote, Hash } from 'lucide-vue-next'

defineProps<{ request: PaymentRequest }>()
</script>

<template>
  <div class="p-5 space-y-5 overflow-y-auto h-full">
    <!-- Header: Status + Amount -->
    <div class="flex items-start justify-between">
      <div>
        <div class="text-xs text-neutral-400 font-mono mb-1">
          {{ request.id.slice(0, 8).toUpperCase() }}
        </div>
        <StatusBadge :status="request.status" />
      </div>
      <div class="text-right">
        <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total</div>
        <div class="text-2xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
          {{ request.totalAmount.format() }}
        </div>
        <div class="text-xs text-neutral-400">{{ request.currency }}</div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <div class="grid grid-cols-2 gap-3">
      <div class="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg">
        <User class="h-4 w-4 text-neutral-400 shrink-0" />
        <div>
          <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Requester
          </div>
          <div class="text-sm font-mono text-neutral-700">
            {{ request.requesterId.slice(0, 8) }}…
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg">
        <User class="h-4 w-4 text-neutral-400 shrink-0" />
        <div>
          <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Beneficiary
          </div>
          <div class="text-sm font-mono text-neutral-700">
            {{ request.beneficiaryId.slice(0, 8) }}…
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg">
        <Hash class="h-4 w-4 text-neutral-400 shrink-0" />
        <div>
          <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Approval Step
          </div>
          <div class="text-sm font-medium text-neutral-700">
            Step {{ request.currentApprovalStep }}
          </div>
        </div>
      </div>

      <div
        v-if="request.bankAccountId"
        class="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg"
      >
        <Banknote class="h-4 w-4 text-neutral-400 shrink-0" />
        <div>
          <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Bank Account
          </div>
          <div class="text-sm font-mono text-neutral-700">
            {{ request.bankAccountId.slice(0, 8) }}…
          </div>
        </div>
      </div>

      <div
        v-if="request.submittedAt"
        class="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg"
      >
        <Calendar class="h-4 w-4 text-neutral-400 shrink-0" />
        <div>
          <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Submitted
          </div>
          <div class="text-sm text-neutral-700">{{ request.submittedAt }}</div>
        </div>
      </div>

      <div v-if="request.paidAt" class="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg">
        <Calendar class="h-4 w-4 text-neutral-400 shrink-0" />
        <div>
          <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Paid</div>
          <div class="text-sm text-neutral-700">{{ request.paidAt }}</div>
        </div>
      </div>
    </div>

    <!-- Justification -->
    <div>
      <div class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
        Justification
      </div>
      <p
        class="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100"
      >
        {{ request.justification }}
      </p>
    </div>
  </div>
</template>
