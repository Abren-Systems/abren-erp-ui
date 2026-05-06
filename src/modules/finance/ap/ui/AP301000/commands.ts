import type { ScreenCommand } from '@/platform/commands'

/**
 * AP301000 — Payment Request Screen Commands
 *
 * Declarative command definitions. The platform toolbar reads these
 * to determine Expected Next Action, More Menu grouping, and visibility.
 * Execution is handled by the controller's registerCommand() registry.
 */
export const AP301000_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'submit',
    kind: 'workflow',
    labelKey: 'Submit',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['DRAFT', 'REJECTED'],
    to: 'SUBMITTED',
    requiresConfirmation: true,
    confirmationMessageKey: 'Submit this request for approval?',
  },
  {
    key: 'approve',
    kind: 'workflow',
    labelKey: 'Approve',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['SUBMITTED'],
    to: 'APPROVED',
    requiresConfirmation: true,
    confirmationMessageKey: 'Approve this payment request?',
  },
  {
    key: 'reject',
    kind: 'workflow',
    labelKey: 'Reject',
    variant: 'danger',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['SUBMITTED'],
    to: 'REJECTED',
    requiresConfirmation: true,
    confirmationMessageKey: 'Reject this payment request?',
  },
  {
    key: 'authorize',
    kind: 'workflow',
    labelKey: 'Authorize',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    from: ['APPROVED'],
    to: 'AUTHORIZED',
    requiresConfirmation: true,
    confirmationMessageKey: 'Authorize this payment?',
  },
  {
    key: 'cancel',
    kind: 'utility',
    labelKey: 'Cancel Request',
    variant: 'danger',
    categoryKey: 'other',
    from: ['DRAFT', 'SUBMITTED'],
    requiresConfirmation: true,
    confirmationMessageKey: 'Cancel this request permanently?',
  },
]
