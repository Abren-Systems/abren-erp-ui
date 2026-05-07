import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * IN2040PL Command Registry
 */
export const IN2040PL_COMMANDS: Record<string, ScreenCommand> = {
  create: {
    key: 'create',
    labelKey: 'Add Warehouse',
    variant: 'primary',
    displayOnMainToolbar: true,
    kind: 'utility',
  },
}
