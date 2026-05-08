import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type { ScreenId } from '@/platform/screen-runtime/screen-id.types'

export const inventoryWorkspace: WorkspaceContract = {
  id: 'inventory',
  titleKey: 'Inventory',
  icon: 'package',
  requiredPermissions: ['inventory:view'],
  tiles: [],
  categories: [
    {
      id: 'transactions',
      labelKey: 'Transactions',
      links: [
        {
          id: 'in3030pl',
          labelKey: 'Issues',
          screenId: 'IN3030PL' as ScreenId,
          requiredPermissions: ['inventory:view'],
        },
      ],
    },
    {
      id: 'profiles',
      labelKey: 'Profiles',
      links: [
        {
          id: 'in2025pl',
          labelKey: 'Stock Items',
          screenId: 'IN2025PL' as ScreenId,
          requiredPermissions: ['inventory:view'],
        },
        {
          id: 'in2040pl',
          labelKey: 'Item Classes',
          screenId: 'IN2040PL' as ScreenId,
          requiredPermissions: ['inventory:view'],
        },
      ],
    },
  ],
}
