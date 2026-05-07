import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

export const apWorkspace: WorkspaceContract = {
  id: 'ap',
  titleKey: 'Payables',
  icon: 'credit-card',
  requiredPermissions: ['ap.view'],
  tiles: [
    // Tiles omitted for Phase 1
  ],
  categories: [
    {
      id: 'transactions',
      labelKey: 'Transactions',
      links: [
        {
          id: 'ap301000',
          labelKey: 'Bills and Adjustments',
          screenId: 'AP301000' as ScreenId,
          requiredPermissions: ['ap.AP301000.view'],
        },
        {
          id: 'ap302000',
          labelKey: 'Checks and Payments',
          screenId: 'AP302000' as ScreenId,
          requiredPermissions: ['ap.AP302000.view'],
        },
      ],
    },
    {
      id: 'profiles',
      labelKey: 'Profiles',
      links: [
        {
          id: 'ap201000',
          labelKey: 'Vendors',
          screenId: 'AP201000' as ScreenId,
          requiredPermissions: ['ap.AP201000.view'],
        },
      ],
    },
    {
      id: 'processes',
      labelKey: 'Processes',
      links: [
        {
          id: 'ap501000',
          labelKey: 'Prepare Payments',
          screenId: 'AP501000' as ScreenId,
          requiredPermissions: ['ap.AP501000.view'],
        },
      ],
    },
    {
      id: 'reports',
      labelKey: 'Reports',
      links: [
        {
          id: 'ap601000',
          labelKey: 'AP Balance by Vendor',
          screenId: 'AP601000' as ScreenId,
          requiredPermissions: ['ap.AP601000.view'],
        },
      ],
    },
  ],
}
