import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'
import { inventoryScreens } from './screens'

export const inventoryModule: BusinessDomain = {
  id: 'inventory',
  name: 'Inventory',
  category: 'business',
  permissions: ['inventory:view', 'inventory:write'],
  icon: 'warehouse',
  routes,
  screens: inventoryScreens,
}
