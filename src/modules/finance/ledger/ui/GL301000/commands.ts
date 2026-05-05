import type { ScreenCommand } from '@/platform/commands'

/**
 * GL301000 — Journal Entries Screen Commands
 */
export const GL301000_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'post',
    labelKey: 'Post Entry',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['DRAFT'],
    to: 'POSTED',
    requiresConfirmation: false,
  },
  {
    key: 'void',
    labelKey: 'Void Entry',
    variant: 'danger',
    categoryKey: 'processing',
    displayOnMainToolbar: false,
    from: ['POSTED'],
    to: 'VOIDED',
    requiresConfirmation: true,
    confirmationMessageKey:
      'Are you sure you want to void this entry? This action cannot be undone.',
  },
]
