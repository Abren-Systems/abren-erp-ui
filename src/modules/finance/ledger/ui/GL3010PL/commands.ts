import type { ScreenCommand } from '@/platform/commands'

export const GL3010PL_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'create',
    kind: 'utility',
    labelKey: 'New Entry',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    icon: 'plus',
  },
]
