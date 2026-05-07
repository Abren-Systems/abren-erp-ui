import type { ScreenCommand } from '@/platform/commands'

export const GL101000_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'save',
    kind: 'utility',
    labelKey: 'Save Settings',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
  },
]
