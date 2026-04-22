<script setup lang="ts">
import { AppBadge, AppDrawer } from '@/shared/components/primitives'
import { History, Clock } from 'lucide-vue-next'
import type { VendorBill } from '../../../domain/ap.types'

/**
 * Stage 3: TraceDrawer — Vendor Bill Provenance.
 *
 * Lazy-loaded contextual panel: workflow history and GL journal impact.
 */

defineProps<{
  open: boolean
  bill: VendorBill
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()
</script>

<template>
  <AppDrawer
    :open="open"
    title="Trace: Vendor Bill"
    description="Workflow history and financial impact of this bill."
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <template #header-icon>
      <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
        <History class="h-5 w-5 text-[var(--color-primary-600)]" />
      </div>
    </template>

    <div class="space-y-8">
      <!-- Workflow Timeline -->
      <section>
        <h3 class="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)] flex items-center gap-2">
          <Clock :size="12" />
          Workflow History
        </h3>
        <div class="space-y-3">
          <div class="flex items-start gap-4 p-4 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
            <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-neutral-400)]" />
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-neutral-900)]">Draft Registered</p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-0.5">
                Bill {{ bill.billNumber }} inputted.
              </p>
            </div>
            <AppBadge variant="neutral">DRAFT</AppBadge>
          </div>

          <div
            v-if="['VALIDATED', 'PAID'].includes(bill.status)"
            class="flex items-start gap-4 p-4 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
          >
            <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-500)]" />
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-neutral-900)]">Validated & Accrued</p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-0.5">
                AP Accrual posted to General Ledger.
              </p>
            </div>
            <AppBadge variant="success">VALIDATED</AppBadge>
          </div>

          <div
            v-if="bill.status === 'PAID'"
            class="flex items-start gap-4 p-4 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
          >
            <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success-600)]" />
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-neutral-900)]">Marked as Paid</p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-0.5">
                Via Payment Request link.
              </p>
            </div>
            <AppBadge variant="success">PAID</AppBadge>
          </div>
        </div>
      </section>
    </div>
  </AppDrawer>
</template>
