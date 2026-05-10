import type { BusinessDomain } from '@/shared/types/module.types'
import { inventoryRoutes } from './routes'
import { inventoryScreens } from './screens'

export const inventoryModule: BusinessDomain = {
  id: 'inventory',
  name: 'Inventory',
  category: 'business',
  permissions: ['inventory:view', 'inventory:write'],
  routes: inventoryRoutes,
  screens: inventoryScreens,
  menuItems: [
    {
      label: 'Stock Items',
      route: 'inventory.stock',
      icon: 'box',
      permissions: ['inventory:view'],
    },
    {
      label: 'Warehouses',
      route: 'inventory.warehouses',
      icon: 'warehouse',
      permissions: ['inventory:view'],
    },
    {
      label: 'Adjustments',
      route: 'inventory.adjustments',
      icon: 'refresh-cw',
      permissions: ['inventory:view'],
    },
  ],
}
