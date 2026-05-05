<script setup lang="ts">
import { computed } from 'vue'
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
  hideHeader?: boolean
}>()

interface TimelineStep {
  status: string
  label: string
  sub: string
}

const steps = computed(() => {
  const currentStatus = props.request.status

  const allSteps: TimelineStep[] = [
    {
      status: 'DRAFT',
      label: 'Created',
      sub: props.request.submittedAt
        ? `Initiated by ${props.request.requesterId.slice(0, 8)}`
        : 'Drafting in progress...',
    },
    {
      status: 'SUBMITTED',
      label: 'Submitted',
      sub: props.request.submittedAt
        ? BusinessDate.format(props.request.submittedAt)
        : 'Waiting for submission',
    },
    {
      status: 'APPROVED',
      label: 'Approved',
      sub: ['APPROVED', 'AUTHORIZED'].includes(currentStatus)
        ? `Governance cleared`
        : 'Pending approval',
    },
    {
      status: 'REJECTED',
      label: 'Rejected',
      sub: currentStatus === 'REJECTED' ? 'Action required' : 'No issues',
    },
    {
      status: 'AUTHORIZED',
      label: 'Authorized',
      sub: props.request.authorizedAt ? `Ready for settlement` : 'Awaiting finance clearance',
    },
  ]

  return allSteps.filter((s) => {
    // Always show these milestones
    if (['DRAFT', 'SUBMITTED'].includes(s.status)) return true
    if (s.status === 'APPROVED')
      return ['APPROVED', 'AUTHORIZED', 'SUBMITTED'].includes(currentStatus)
    if (s.status === 'REJECTED') return currentStatus === 'REJECTED'
    if (s.status === 'AUTHORIZED') return ['AUTHORIZED', 'APPROVED'].includes(currentStatus)
    return false
  })
})

const getVariant = (stepStatus: string) => {
  const current = props.request.status

  // Logic: Is this step completed or current?
  if (stepStatus === 'DRAFT') return 'neutral' // Base step
  if (stepStatus === 'SUBMITTED' && ['SUBMITTED', 'APPROVED', 'AUTHORIZED'].includes(current))
    return 'info'
  if (stepStatus === 'APPROVED' && ['APPROVED', 'AUTHORIZED'].includes(current)) return 'success'
  if (stepStatus === 'AUTHORIZED' && current === 'AUTHORIZED') return 'success'
  if (stepStatus === 'REJECTED' && current === 'REJECTED') return 'danger'

  return 'inactive'
}
</script>

<template>
  <div class="space-y-6">
    <h3
      v-if="!hideHeader"
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
            getVariant(step.status) === 'neutral' ? 'bg-neutral-400' : '',
            getVariant(step.status) === 'info' ? 'bg-primary-500' : '',
            getVariant(step.status) === 'success' ? 'bg-success-500' : '',
            getVariant(step.status) === 'danger' ? 'bg-red-500' : '',
            getVariant(step.status) === 'inactive' ? 'bg-neutral-200' : '',
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
              :variant="
                ['success', 'info', 'danger'].includes(getVariant(step.status))
                  ? (getVariant(step.status) as any)
                  : 'neutral'
              "
              class="text-[9px] uppercase tracking-tighter px-1.5 h-4"
              :class="{ 'opacity-50 grayscale': getVariant(step.status) === 'inactive' }"
            >
              {{ step.status }}
            </AppBadge>
          </div>
          <div class="flex flex-col gap-0.5">
            <p
              class="text-[11px] font-medium"
              :class="
                getVariant(step.status) === 'inactive' ? 'text-neutral-300' : 'text-neutral-500'
              "
            >
              {{ step.sub }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
