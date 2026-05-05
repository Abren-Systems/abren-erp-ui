<script setup lang="ts">
/**
 * ConfirmDialog — Reusable confirmation dialog for screen commands.
 *
 * Platform-level component that renders a confirmation prompt for
 * commands marked with `requiresConfirmation: true`.
 */
import { AppButton, AppDialog } from '@/shared/components/primitives'

const props = defineProps<{
  /** Whether the dialog is currently visible */
  open: boolean
  /** Title of the confirmation dialog */
  title: string
  /** Description / message body */
  description: string
  /** Visual variant of the confirm button */
  variant?: 'primary' | 'danger'
  /** Whether the action is currently executing */
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

function close() {
  emit('update:open', false)
}

function confirm() {
  emit('confirm')
  close()
}
</script>

<template>
  <AppDialog :open="open" :title="title" size="sm" @update:open="emit('update:open', $event)">
    <p class="text-sm text-[var(--color-neutral-600)]">
      {{ description }}
    </p>
    <template #footer>
      <AppButton variant="outline" @click="close">Cancel</AppButton>
      <AppButton
        :variant="variant === 'danger' ? 'primary' : 'primary'"
        :class="
          variant === 'danger'
            ? 'bg-[var(--color-danger-600)] hover:bg-[var(--color-danger-700)]'
            : ''
        "
        :loading="loading"
        @click="confirm"
      >
        Confirm
      </AppButton>
    </template>
  </AppDialog>
</template>
