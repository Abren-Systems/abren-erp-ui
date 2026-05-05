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
      label: 'Warehouses',
      route: 'inventory.warehouses',
      icon: 'warehouse',
      permissions: ['inventory:view'],
    },
    {
      label: 'Stock Positions',
      route: 'inventory.stock',
      icon: 'boxes',
      permissions: ['inventory:view'],
    },
  ],
}
