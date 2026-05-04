<script setup lang="ts">
/**
 * PaymentRequestActions — Server-driven action bar.
 *
 * Constraint: The component renders actions based on the provided array.
 * It does not check domain state (e.g., `request.status === 'APPROVED'`) to decide visibility.
 */
import { ref, computed } from 'vue'
import { AppButton, AppDialog } from '@/shared/components/primitives'

import type { ScreenAction } from '../commands/payment-request.commands'

const props = defineProps<{
  actions: ScreenAction[]
  isPending?: boolean
}>()

const emit = defineEmits<{
  (e: 'action', key: string): void
}>()

const confirmState = ref<{ open: boolean; action: ScreenAction | null }>({
  open: false,
  action: null,
})

function onActionClick(action: ScreenAction) {
  if (!action.enabled) return

  if (action.requiresConfirmation) {
    confirmState.value = { open: true, action }
  } else {
    emit('action', action.key)
  }
}

function confirmAction() {
  if (confirmState.value.action) {
    emit('action', confirmState.value.action.key)
    confirmState.value.open = false
  }
}

const confirmTitle = computed(() => {
  return confirmState.value.action ? `Confirm ${confirmState.value.action.label}` : 'Confirm'
})

const confirmDescription = computed(() => {
  return confirmState.value.action?.description ?? 'Are you sure you want to proceed?'
})
</script>

<template>
  <div class="flex items-center gap-2">
    <AppButton
      v-for="action in actions"
      :key="action.key"
      :variant="
        action.variant === 'danger'
          ? 'stealth'
          : action.variant === 'neutral'
            ? 'outline'
            : 'primary'
      "
      :disabled="!action.enabled || isPending"
      :class="
        action.variant === 'danger'
          ? 'text-danger-600 hover:bg-danger-50 hover:text-danger-700'
          : ''
      "
      size="sm"
      @click="onActionClick(action)"
    >
      {{ action.label }}
    </AppButton>

    <AppDialog v-model:open="confirmState.open" :title="confirmTitle" size="sm">
      <p class="text-sm text-neutral-600">
        {{ confirmDescription }}
      </p>
      <template #footer>
        <AppButton variant="outline" @click="confirmState.open = false">Cancel</AppButton>
        <AppButton
          :variant="confirmState.action?.variant === 'danger' ? 'primary' : 'primary'"
          :class="
            confirmState.action?.variant === 'danger' ? 'bg-danger-600 hover:bg-danger-700' : ''
          "
          :loading="isPending"
          @click="confirmAction"
        >
          Confirm
        </AppButton>
      </template>
    </AppDialog>
  </div>
</template>
