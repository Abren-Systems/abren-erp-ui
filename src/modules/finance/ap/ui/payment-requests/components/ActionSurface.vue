<script setup lang="ts">
/**
 * Action Surface Hierarchy Component.
 *
 * Implements the mandatory Action Surface pattern from UX_ARCHITECTURE.md:
 *   - Primary (State-Advancing): Always visible, prominent
 *   - Secondary (Supporting): Visible but subdued
 *   - Tertiary (Rare/Destructive): Hidden behind overflow menu
 *
 * Actions are projected from the backend state machine — buttons only
 * render when the current state permits the transition.
 */
import { computed } from 'vue'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu'
import { MoreHorizontal, Send, CheckCircle, Ban, CreditCard } from 'lucide-vue-next'
import type { PaymentRequestStatus } from '../../../domain/ap.types'

const props = defineProps<{
  status: PaymentRequestStatus
  isActionPending: boolean
}>()

const emit = defineEmits<{
  submit: []
  approve: []
  reject: []
  pay: []
}>()

/** Primary actions: Only state-advancing transitions. */
const primaryAction = computed(() => {
  const map: Partial<
    Record<PaymentRequestStatus, { label: string; event: string; icon: typeof Send }>
  > = {
    DRAFT: { label: 'Submit for Approval', event: 'submit', icon: Send },
    SUBMITTED: { label: 'Approve', event: 'approve', icon: CheckCircle },
    APPROVED: { label: 'Execute Payment', event: 'pay', icon: CreditCard },
  }
  return map[props.status] ?? null
})

/** Tertiary actions: Destructive, hidden behind overflow menu. */
const tertiaryActions = computed(() => {
  if (props.status === 'SUBMITTED') {
    return [{ label: 'Reject', event: 'reject', destructive: true }]
  }
  return []
})

function handlePrimary() {
  if (!primaryAction.value) return
  emit(primaryAction.value.event as 'submit' | 'approve' | 'pay')
}

function handleTertiary(event: string) {
  emit(event as 'reject')
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Primary Action (State-Advancing) -->
    <Button
      v-if="primaryAction"
      variant="default"
      size="sm"
      :disabled="isActionPending"
      class="gap-1.5"
      @click="handlePrimary"
    >
      <component :is="primaryAction.icon" class="h-3.5 w-3.5" />
      {{ primaryAction.label }}
    </Button>

    <!-- Tertiary Actions (Overflow Menu) -->
    <DropdownMenu v-if="tertiaryActions.length > 0">
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon" class="h-8 w-8" :disabled="isActionPending">
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          v-for="action in tertiaryActions"
          :key="action.event"
          :class="action.destructive ? 'text-danger-600 focus:text-danger-600' : ''"
          @click="handleTertiary(action.event)"
        >
          <Ban v-if="action.destructive" class="mr-2 h-3.5 w-3.5" />
          {{ action.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
