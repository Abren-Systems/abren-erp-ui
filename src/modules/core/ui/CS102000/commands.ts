import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * CS102000 Command Registry
 */
export const CS102000_COMMANDS: Record<string, ScreenCommand> = {
  bulkEdit: {
    key: 'bulkEdit',
    labelKey: 'Edit Settings',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
}

export const CS102000_COMMANDS_LIST = Object.values(CS102000_COMMANDS)
