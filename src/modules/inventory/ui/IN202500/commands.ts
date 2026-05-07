import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * IN202500 Command Registry
 */
export const IN202500_COMMANDS: Record<string, ScreenCommand> = {
  save: {
    key: 'save',
    labelKey: 'Save',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
}
