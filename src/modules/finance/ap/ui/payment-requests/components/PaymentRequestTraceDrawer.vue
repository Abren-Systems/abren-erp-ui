<script setup lang="ts">
import { AppBadge, AppDrawer } from '@/shared/components/primitives'
import { History, FileText, Banknote } from 'lucide-vue-next'
import PaymentRequestTimeline from './PaymentRequestTimeline.vue'
import type { PaymentRequest } from '../../../domain/ap.types'

/**
 * Stage 3: TraceDrawer — Payment Request Provenance.
 *
 * Lazy-loaded contextual panel: workflow history, GL journal impact,
 * and linked source documents. Only shown when the user explicitly requests it.
 */

defineProps<{
  open: boolean
  request: PaymentRequest
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()
</script>

<template>
  <AppDrawer
    :open="open"
    title="Trace: Payment Request"
    description="Workflow history and financial impact of this request."
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <template #header-icon>
      <div class="p-2 bg-[var(--color-primary-50)] rounded-xl">
        <History class="h-5 w-5 text-[var(--color-primary-600)]" />
      </div>
    </template>

    <div class="space-y-8">
      <!-- Shared Timeline -->
      <PaymentRequestTimeline :request="request" />

      <!-- GL Journal Impact -->
      <section v-if="request.targetLiabilityAccountId">
        <h3
          class="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-neutral-400)] flex items-center gap-2"
        >
          <Banknote :size="12" />
          Financial Impact (GL)
        </h3>
        <div
          class="bg-white rounded-xl border border-[var(--color-neutral-200)] shadow-sm overflow-hidden"
        >
          <div
            class="px-4 py-3 flex justify-between items-center border-b border-[var(--color-neutral-100)]"
          >
            <span
              class="text-[10px] font-bold text-[var(--color-neutral-500)] uppercase tracking-wider"
              >Liability Account</span
            >
            <code
              class="text-[10px] font-bold text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-1.5 py-0.5 rounded-md"
            >
              {{ request.targetLiabilityAccountId.slice(0, 8) }}…
            </code>
          </div>
          <div class="px-4 py-3 flex justify-between items-center">
            <span
              class="text-[10px] font-bold text-[var(--color-neutral-500)] uppercase tracking-wider"
              >Disbursement Account</span
            >
            <code
              class="text-[10px] font-bold text-[var(--color-neutral-600)] bg-[var(--color-neutral-50)] px-1.5 py-0.5 rounded-md"
            >
              {{ request.bankAccountId?.slice(0, 8) ?? '—' }}
            </code>
          </div>
        </div>
      </section>

      <!-- Source Document -->
      <section v-if="request.sourceModule">
        <h3
          class="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-neutral-400)] flex items-center gap-2"
        >
          <FileText :size="12" />
          Source Document
        </h3>
        <div
          class="bg-white rounded-xl border border-[var(--color-neutral-200)] shadow-sm overflow-hidden"
        >
          <div
            class="px-4 py-3 flex justify-between items-center border-b border-[var(--color-neutral-100)]"
          >
            <span
              class="text-[10px] font-bold text-[var(--color-neutral-500)] uppercase tracking-wider"
              >Originating Module</span
            >
            <span class="text-xs font-bold text-[var(--color-neutral-900)]">{{
              request.sourceModule
            }}</span>
          </div>
          <div class="px-4 py-3 flex justify-between items-center">
            <span
              class="text-[10px] font-bold text-[var(--color-neutral-500)] uppercase tracking-wider"
              >Internal Reference</span
            >
            <code
              class="text-[10px] font-bold text-[var(--color-neutral-600)] bg-[var(--color-neutral-50)] px-1.5 py-0.5 rounded-md"
              >{{ request.sourceId ?? '—' }}</code
            >
          </div>
        </div>
      </section>
    </div>
  </AppDrawer>
</template>
