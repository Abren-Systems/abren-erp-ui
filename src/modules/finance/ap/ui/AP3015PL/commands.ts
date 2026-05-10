import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * AP3015PL Command Registry
 */
export const AP3015PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'New Request',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
  refresh: {
    key: 'refresh',
    labelKey: 'Refresh',
    variant: 'neutral',
    displayOnMainToolbar: true,
    kind: 'utility',
  },
}

export const AP3015PL_COMMANDS_LIST = Object.values(AP3015PL_COMMANDS)
