import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * TX2055PL Command Registry
 */
export const TX2055PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'New Tax Group',
    displayOnMainToolbar: true,
    kind: 'utility',
    variant: 'neutral',
  },
}
