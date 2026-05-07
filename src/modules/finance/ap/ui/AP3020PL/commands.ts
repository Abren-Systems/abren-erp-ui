import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * AP3020PL Command Registry
 */
export const AP3020PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'New Bill',
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

export const AP3020PL_COMMANDS_LIST = Object.values(AP3020PL_COMMANDS)
