import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import { createScreenId } from '@/platform/screen-runtime/screen-id.types'

/** Hub links follow the same order as `inventoryModule.menuItems`. */
export const inventoryWorkspace: WorkspaceContract = {
  id: 'inventory',
  titleKey: 'Inventory',
  icon: 'package',
  requiredPermissions: ['inventory:view'],
  tiles: [],
  categories: [
    {
      id: 'screens',
      labelKey: 'Screens',
      links: [
        {
          id: 'in2025pl',
          labelKey: 'Stock Items',
          screenId: createScreenId('IN2025PL'),
          requiredPermissions: ['inventory:view'],
        },
        {
          id: 'in2040pl',
          labelKey: 'Warehouses',
          screenId: createScreenId('IN2040PL'),
          requiredPermissions: ['inventory:view'],
        },
        {
          id: 'in3030pl',
          labelKey: 'Adjustments',
          screenId: createScreenId('IN3030PL'),
          requiredPermissions: ['inventory:view'],
        },
      ],
    },
  ],
}
