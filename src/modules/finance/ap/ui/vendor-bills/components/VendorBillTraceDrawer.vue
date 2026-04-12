<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/sheet'
import { Badge } from '@/shared/components/badge'
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
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[480px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Trace: Vendor Bill</SheetTitle>
        <SheetDescription> Workflow history and financial impact of this bill. </SheetDescription>
      </SheetHeader>

      <div class="space-y-6 py-6">
        <!-- Workflow Timeline -->
        <section>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Workflow History
          </h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3 rounded-md border p-3">
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-neutral-400" />
              <div class="flex-1">
                <p class="text-sm font-medium">Draft Registered</p>
                <p class="text-xs text-neutral-500">Bill {{ bill.billNumber }} inputted.</p>
              </div>
              <Badge variant="outline" class="text-xs">DRAFT</Badge>
            </div>

            <div
              v-if="['VALIDATED', 'PAID'].includes(bill.status)"
              class="flex items-start gap-3 rounded-md border p-3"
            >
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Validated & Accrued</p>
                <p class="text-xs text-neutral-500">AP Accrual posted to General Ledger.</p>
              </div>
              <Badge variant="default" class="text-xs">VALIDATED</Badge>
            </div>

            <div v-if="bill.status === 'PAID'" class="flex items-start gap-3 rounded-md border p-3">
              <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <div class="flex-1">
                <p class="text-sm font-medium">Marked as Paid</p>
                <p class="text-xs text-neutral-500">Via Payment Request link.</p>
              </div>
              <Badge variant="default" class="text-xs">PAID</Badge>
            </div>
          </div>
        </section>
      </div>
    </SheetContent>
  </Sheet>
</template>
