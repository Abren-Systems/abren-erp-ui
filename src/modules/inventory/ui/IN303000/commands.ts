import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * IN303000 Command Registry
 */
export const IN303000_COMMANDS: Record<string, ScreenCommand> = {
  post: {
    key: 'post',
    labelKey: 'Post Adjustment',
    variant: 'primary',
    displayOnMainToolbar: true,
  },
}
