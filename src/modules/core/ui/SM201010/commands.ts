import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * SM201010 Command Registry
 */
export const SM201010_COMMANDS: Record<string, ScreenCommand> = {
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

export const SM201010_COMMANDS_LIST = Object.values(SM201010_COMMANDS)
