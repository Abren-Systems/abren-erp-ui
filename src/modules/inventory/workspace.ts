import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

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
          screenId: createScreenId('IN3030PL'),
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
          screenId: createScreenId('IN2025PL'),
          requiredPermissions: ['inventory:view'],
        },
        {
          id: 'in2040pl',
          labelKey: 'Item Classes',
          screenId: createScreenId('IN2040PL'),
          requiredPermissions: ['inventory:view'],
        },
      ],
    },
  ],
}
