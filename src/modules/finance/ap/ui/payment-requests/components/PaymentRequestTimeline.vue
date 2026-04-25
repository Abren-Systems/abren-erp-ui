<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import { AppBadge } from '@/shared/components/primitives'
import { BusinessDate } from '@/shared/domain/business-date'
import type { PaymentRequest } from '../../../domain/ap.types'

/**
 * PaymentRequestTimeline — The authoritative audit trail component.
 * Shared between the integrated DetailPage sidebar and the Quick-Trace drawer.
 */

const props = defineProps<{
  request: PaymentRequest
  density?: 'compact' | 'normal'
}>()

interface TimelineStep {
  status: string
  label: string
  sub: string
  variant: 'neutral' | 'info' | 'success' | 'danger'
}

const steps: TimelineStep[] = [
  {
    status: 'DRAFT',
    label: 'Created',
    sub: props.request.submittedAt
      ? `Initiated by ${props.request.requesterId.slice(0, 8)}`
      : 'Drafting in progress...',
    variant: 'neutral',
  },
  {
    status: 'SUBMITTED',
    label: 'Submitted',
    sub: props.request.submittedAt
      ? BusinessDate.format(props.request.submittedAt)
      : 'Waiting for submission',
    variant: 'info',
  },
  {
    status: 'APPROVED',
    label: 'Approved',
    sub:
      props.request.status === 'APPROVED' || props.request.status === 'AUTHORIZED'
        ? `Governance cleared`
        : 'Pending approval',
    variant: 'success',
  },
  { status: 'REJECTED', label: 'Rejected', sub: 'Action required', variant: 'danger' },
  {
    status: 'AUTHORIZED',
    label: 'Authorized',
    sub: props.request.authorizedAt ? `Ready for settlement` : 'Awaiting finance clearance',
    variant: 'success',
  },
  { status: 'CANCELLED', label: 'Cancelled', sub: 'Request abandoned', variant: 'danger' },
].filter((s) => {
  const status = props.request.status
  // Always show these milestones
  if (['DRAFT', 'SUBMITTED'].includes(s.status)) return true

  if (s.status === 'APPROVED')
    return ['APPROVED', 'AUTHORIZED'].includes(status) || status === 'SUBMITTED'
  if (s.status === 'REJECTED') return status === 'REJECTED'
  if (s.status === 'CANCELLED') return status === 'CANCELLED'
  if (s.status === 'AUTHORIZED') return status === 'AUTHORIZED' || status === 'APPROVED'
  return false
}) as TimelineStep[]
</script>

<template>
  <div class="space-y-6">
    <h3
      class="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-neutral-400)] flex items-center gap-2"
    >
      <Clock :size="12" />
      Audit Trail
    </h3>

    <div class="relative space-y-6 ml-1">
      <!-- Vertical Connector Line -->
      <div class="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-100" aria-hidden="true" />

      <div v-for="(step, index) in steps" :key="index" class="relative pl-7 group">
        <!-- Timeline Dot -->
        <div
          class="absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-white shadow-sm ring-1 ring-neutral-200 transition-transform group-hover:scale-125"
          :class="[
            step.variant === 'neutral' ? 'bg-neutral-300' : '',
            step.variant === 'info' ? 'bg-primary-500' : '',
            step.variant === 'success' ? 'bg-success-500' : '',
            step.variant === 'danger' ? 'bg-red-500' : '',
          ]"
        />

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <p
              class="font-bold text-neutral-900 leading-tight"
              :class="density === 'compact' ? 'text-[12px]' : 'text-[13px]'"
            >
              {{ step.label }}
            </p>
            <AppBadge
              :variant="step.variant"
              class="text-[9px] uppercase tracking-tighter px-1.5 h-4"
              >{{ step.status }}</AppBadge
            >
          </div>
          <div class="flex flex-col gap-0.5">
            <p class="text-[11px] font-medium text-neutral-500">
              {{ step.sub }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
