import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * CA202000 — Bank Account Commands
 *
 * Workflow: ACTIVE ↔ INACTIVE, ACTIVE → FROZEN
 * FROZEN is a terminal hold state (requires manual investigation).
 */
export const CA202000_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'activate',
    labelKey: 'Activate',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['INACTIVE'],
    to: 'ACTIVE',
  },
  {
    key: 'deactivate',
    labelKey: 'Deactivate',
    variant: 'neutral',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['ACTIVE'],
    to: 'INACTIVE',
    requiresConfirmation: true,
    confirmationMessageKey: 'Deactivating this account will prevent new transactions. Continue?',
  },
  {
    key: 'freeze',
    labelKey: 'Freeze Account',
    variant: 'danger',
    categoryKey: 'processing',
    displayOnMainToolbar: false,
    from: ['ACTIVE'],
    to: 'FROZEN',
    requiresConfirmation: true,
    confirmationMessageKey:
      'Freezing this account will block all transactions and requires manual review to reverse. Continue?',
  },
] as const
