import type { ScreenCommand } from '@/platform/commands'

export const userCommands: ScreenCommand[] = [
  {
    key: 'invite',
    labelKey: 'core.CR201000.actions.invite',
    icon: 'user-plus',
    variant: 'primary',
    categoryKey: 'processing',
    displayOnMainToolbar: true,
  },
  {
    key: 'executeInvite',
    labelKey: 'core.CR201000.actions.executeInvite',
    variant: 'primary',
  },
  {
    key: 'executeAssign',
    labelKey: 'core.CR201000.actions.executeAssign',
    variant: 'primary',
  },
]
