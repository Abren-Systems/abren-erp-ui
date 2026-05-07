import type { ScreenCommand } from '@/platform/commands'

export const GL2010PL_COMMANDS: readonly ScreenCommand[] = [
  {
    key: 'create',
    kind: 'utility',
    labelKey: 'New Account',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
    icon: 'plus',
  },
]
