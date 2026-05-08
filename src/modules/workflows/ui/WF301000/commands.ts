import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * WF301000 Command Registry
 */
export const WF301000_COMMANDS: Record<string, ScreenCommand> = {
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
