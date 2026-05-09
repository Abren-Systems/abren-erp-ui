import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * SM203500 Command Registry
 */
export const SM203500_COMMANDS: Record<string, ScreenCommand> = {
  bulkEdit: {
    key: 'bulkEdit',
    labelKey: 'Edit Settings',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
}

export const SM203500_COMMANDS_LIST = Object.values(SM203500_COMMANDS)
