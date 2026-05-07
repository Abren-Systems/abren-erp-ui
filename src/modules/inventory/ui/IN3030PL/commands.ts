import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * IN3030PL Command Registry
 */
export const IN3030PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'New Adjustment',
    variant: 'primary',
    displayOnMainToolbar: true,
    kind: 'utility',
  },
}
