<script setup lang="ts">
/**
 * Payment Request Status Badge.
 *
 * Maps domain status strings to semantic badge styles following
 * the State Machine Contract in UX_ARCHITECTURE.md.
 */
import { computed } from 'vue'
import type { PaymentRequestStatus } from '../../../domain/ap.types'

const props = defineProps<{ status: PaymentRequestStatus }>()

const config = computed(() => {
  const map: Record<PaymentRequestStatus, { label: string; classes: string; dot: string }> = {
    DRAFT: {
      label: 'Draft',
      classes: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200',
      dot: 'bg-neutral-400',
    },
    SUBMITTED: {
      label: 'Pending Approval',
      classes: 'bg-warning-50 text-warning-700 ring-1 ring-warning-200',
      dot: 'bg-warning-500',
    },
    APPROVED: {
      label: 'Approved',
      classes: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',
      dot: 'bg-primary-500',
    },
    REJECTED: {
      label: 'Rejected',
      classes: 'bg-danger-50 text-danger-700 ring-1 ring-danger-200',
      dot: 'bg-danger-500',
    },
    PAID: {
      label: 'Paid',
      classes: 'bg-success-50 text-success-700 ring-1 ring-success-200',
      dot: 'bg-success-500',
    },
  }
  return map[props.status]
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200',
      config.classes,
    ]"
  >
    <span :class="['h-1.5 w-1.5 rounded-full', config.dot]" />
    {{ config.label }}
  </span>
</template>
