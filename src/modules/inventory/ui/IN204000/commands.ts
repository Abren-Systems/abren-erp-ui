import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * IN204000 Command Registry
 */
export const IN204000_COMMANDS: Record<string, ScreenCommand> = {
  save: {
    key: 'save',
    labelKey: 'Save',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
}
