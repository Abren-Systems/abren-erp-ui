import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * TX2020PL Command Registry
 */
export const TX2020PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'New Tax Rule',
    displayOnMainToolbar: true,
    kind: 'utility',
    variant: 'neutral',
  },
}
