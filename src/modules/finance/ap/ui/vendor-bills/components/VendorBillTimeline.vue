<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import { BadgeCell } from '@/shared/components/data-grid'
import type { VendorBill } from '../../../domain/ap.types'

/**
 * VendorBillTimeline — Shared audit trail for Vendor Bills.
 * Standardizes how provenance and GL accrual events are visualized.
 */

interface Props {
  bill: VendorBill
  density?: 'default' | 'compact'
}

withDefaults(defineProps<Props>(), {
  density: 'default',
})
</script>

<template>
  <div class="space-y-4">
    <h3
      class="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2 mb-6"
    >
      <Clock :size="12" />
      Workflow History
    </h3>

    <div class="relative space-y-6">
      <!-- Vertical Line -->
      <div class="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-100" />

      <!-- Step: Draft -->
      <div class="relative flex gap-4">
        <div
          class="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-neutral-300 ring-1 ring-neutral-100 z-10"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold text-neutral-900">Bill Registered</p>
            <BadgeCell status="DRAFT" class="scale-75 origin-right" />
          </div>
          <p class="text-[10px] text-neutral-500 mt-1">
            Supplier invoice #{{ bill.billNumber }} entered into intake queue.
          </p>
        </div>
      </div>

      <!-- Step: Validated -->
      <div v-if="['VALIDATED', 'PAID'].includes(bill.status)" class="relative flex gap-4">
        <div
          class="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-primary-600 ring-1 ring-primary-100 z-10"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold text-neutral-900">Validated & Accrued</p>
            <BadgeCell status="VALIDATED" class="scale-75 origin-right" />
          </div>
          <p class="text-[10px] text-neutral-500 mt-1">
            AP Accrual posted to General Ledger. Liability recognized.
          </p>
        </div>
      </div>

      <!-- Step: Paid -->
      <div v-if="bill.status === 'PAID'" class="relative flex gap-4">
        <div
          class="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-green-600 ring-1 ring-green-100 z-10"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold text-neutral-900">Settled</p>
            <BadgeCell status="PAID" class="scale-75 origin-right" />
          </div>
          <p class="text-[10px] text-neutral-500 mt-1">
            Marked as settled via payment requisition.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
