import type { ScreenCommand } from '@/platform/commands'

/**
 * GL201000 — Chart of Accounts Screen Commands
 */
export const GL201000_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'deactivate',
    labelKey: 'Deactivate Account',
    variant: 'danger',
    categoryKey: 'processing',
    displayOnMainToolbar: false,
    requiresConfirmation: true,
    confirmationMessageKey:
      'Are you sure you want to deactivate this account? It will no longer be available for new transactions.',
  },
]
