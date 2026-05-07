import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * TX2010PL Command Registry
 */
export const TX2010PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'New Tax Group',
    displayOnMainToolbar: true,
    kind: 'utility',
    variant: 'neutral',
  },
}
