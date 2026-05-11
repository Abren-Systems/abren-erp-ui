import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * EP503010 Command Registry
 */
export const EP503010_COMMANDS: Record<string, ScreenCommand> = {
  refresh: {
    key: 'refresh',
    labelKey: 'Refresh',
    variant: 'neutral',
    displayOnMainToolbar: true,
    kind: 'utility',
  },
  approve: {
    key: 'approve',
    labelKey: 'Approve',
    variant: 'primary',
    kind: 'workflow',
  },
  reject: {
    key: 'reject',
    labelKey: 'Reject',
    variant: 'danger',
    kind: 'workflow',
  },
}
