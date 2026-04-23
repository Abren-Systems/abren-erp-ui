<script setup lang="ts">
import { AppBadge, AppDrawer } from '@/shared/components/primitives'
import { History, FileText, Clock, Banknote } from 'lucide-vue-next'
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
      <!-- Workflow Timeline -->
      <section>
        <h3
          class="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-neutral-400)] flex items-center gap-2"
        >
          <Clock :size="12" />
          Workflow History
        </h3>
        <div class="space-y-2">
          <div
            v-for="(step, index) in [
              {
                status: 'DRAFT',
                label: 'Created',
                sub: `Requested by ${request.requesterId}`,
                variant: 'neutral',
              },
              {
                status: 'SUBMITTED',
                label: 'Submitted for Approval',
                sub: request.submittedAt ?? 'Date unavailable',
                variant: 'info',
              },
              {
                status: 'APPROVED',
                label: 'Approved',
                sub: `Approved by ${request.assignedApproverId ?? 'approver'}`,
                variant: 'success',
              },
              { status: 'REJECTED', label: 'Rejected', sub: 'Action required', variant: 'danger' },
              {
                status: 'PAID',
                label: 'Payment Recorded',
                sub: request.paidAt ?? 'Date unavailable',
                variant: 'success',
              },
            ].filter((s) => {
              if (s.status === 'DRAFT') return true
              if (s.status === 'SUBMITTED')
                return ['SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'].includes(request.status)
              if (s.status === 'APPROVED') return ['APPROVED', 'PAID'].includes(request.status)
              if (s.status === 'REJECTED') return request.status === 'REJECTED'
              if (s.status === 'PAID') return request.status === 'PAID'
              return false
            })"
            :key="index"
            class="flex items-start gap-4 p-3.5 bg-white rounded-xl border border-[var(--color-neutral-200)] shadow-sm"
          >
            <div
              class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              :class="[
                step.variant === 'neutral' ? 'bg-[var(--color-neutral-400)]' : '',
                step.variant === 'info' ? 'bg-[var(--color-primary-500)]' : '',
                step.variant === 'success' ? 'bg-[var(--color-success-500)]' : '',
                step.variant === 'danger' ? 'bg-[var(--color-danger-500)]' : '',
              ]"
            />
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-neutral-900)]">{{ step.label }}</p>
              <p class="text-[10px] text-[var(--color-neutral-500)] mt-0.5">{{ step.sub }}</p>
            </div>
            <AppBadge :variant="step.variant as any">{{ step.status }}</AppBadge>
          </div>
        </div>
      </section>

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
