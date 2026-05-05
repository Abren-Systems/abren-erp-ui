import type { ScreenCommand } from '@/platform/commands'

/**
 * AP302000 — Vendor Bills Screen Commands
 */
export const AP302000_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'validate',
    labelKey: 'Validate & Accrue',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['DRAFT'],
    to: 'VALIDATED',
    requiresConfirmation: false,
  },
  {
    key: 'reject',
    labelKey: 'Void draft bill',
    variant: 'danger',
    categoryKey: 'processing',
    displayOnMainToolbar: false,
    from: ['DRAFT'],
    to: 'VOIDED', // Or whatever rejected state maps to
    requiresConfirmation: true,
    confirmationMessageKey: 'Are you sure you want to void this draft bill?',
  },
  {
    key: 'create_pr',
    labelKey: 'Create Payment Request',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['VALIDATED'],
    to: 'VALIDATED', // Doesn't change state, just navigates
    requiresConfirmation: false,
  },
]
