import type { ScreenCommand } from '@/platform/commands'

export const tenantCommands: ScreenCommand[] = [
  {
    key: 'bulkEdit',
    labelKey: 'core.CR102000.actions.bulkEdit',
    icon: 'edit-3',
    variant: 'neutral', // Neutral because it's a secondary bulk action, maybe primary depending on context, legacy was "outline"
    categoryKey: 'processing',
    displayOnMainToolbar: true,
  },
]
