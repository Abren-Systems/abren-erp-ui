import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * TX2050PL Command Registry
 */
export const TX2050PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'New Tax',
    displayOnMainToolbar: true,
    kind: 'utility',
    variant: 'neutral',
  },
}
