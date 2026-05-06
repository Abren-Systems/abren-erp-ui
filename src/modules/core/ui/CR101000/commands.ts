import type { ScreenCommand } from '@/platform/commands'

export const roleCommands: ScreenCommand[] = [
  {
    key: 'create',
    labelKey: 'core.CR101000.actions.create',
    icon: 'shield-plus',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
  },
  {
    key: 'executeCreate',
    labelKey: 'core.CR101000.actions.executeCreate',
    variant: 'primary',
  },
]
