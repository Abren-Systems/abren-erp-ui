import { createScreenId } from '@/platform/screen-runtime/screen-id.types'
import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'

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
          screenId: createScreenId('AP301000'),
          requiredPermissions: ['ap.AP301000.view'],
        },
        {
          id: 'ap302000',
          labelKey: 'Checks and Payments',
          screenId: createScreenId('AP302000'),
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
          screenId: createScreenId('AP201000'),
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
          screenId: createScreenId('AP501000'),
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
          screenId: createScreenId('AP601000'),
          requiredPermissions: ['ap.AP601000.view'],
        },
      ],
    },
  ],
}
