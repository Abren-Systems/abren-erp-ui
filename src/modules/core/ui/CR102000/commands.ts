import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * CR102000 Command Registry
 */
export const CR102000_COMMANDS: Record<string, ScreenCommand> = {
  bulkEdit: {
    key: 'bulkEdit',
    labelKey: 'Edit Settings',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
}

export const CR102000_COMMANDS_LIST = Object.values(CR102000_COMMANDS)
