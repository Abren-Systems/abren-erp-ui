import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * CR101000 Command Registry
 */
export const CR101000_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'Add Role',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
  executeCreate: {
    key: 'executeCreate',
    labelKey: 'Save Role',
    variant: 'primary',
  },
}

export const CR101000_COMMANDS_LIST = Object.values(CR101000_COMMANDS)
