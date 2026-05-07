import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * CR201000 Command Registry
 */
export const CR201000_COMMANDS: Record<string, ScreenCommand> = {
  invite: {
    key: 'invite',
    labelKey: 'Invite User',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
  executeInvite: {
    key: 'executeInvite',
    labelKey: 'Send Invite',
    variant: 'primary',
  },
  executeAssign: {
    key: 'executeAssign',
    labelKey: 'Assign Role',
    variant: 'primary',
  },
}

export const CR201000_COMMANDS_LIST = Object.values(CR201000_COMMANDS)
