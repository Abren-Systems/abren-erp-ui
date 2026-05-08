import type { ScreenCommand } from '@/platform/commands/command.types'

export const GL102000_COMMANDS: Record<string, ScreenCommand> = {
  refresh: {
    key: 'refresh',
    labelKey: 'Refresh',
    variant: 'neutral',
    displayOnMainToolbar: true,
    kind: 'utility',
  },
  create: {
    key: 'create',
    labelKey: 'New Period',
    variant: 'primary',
    displayOnMainToolbar: true,
    kind: 'local',
  },
}

export const GL102000_COMMANDS_LIST = Object.values(GL102000_COMMANDS)
