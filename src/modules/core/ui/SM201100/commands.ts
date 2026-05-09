import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * SM201100 Command Registry
 */
export const SM201100_COMMANDS: Record<string, ScreenCommand> = {
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

export const SM201100_COMMANDS_LIST = Object.values(SM201100_COMMANDS)
