import type { BusinessDomain } from '@/shared/types/module.types'
import { taxRoutes } from './routes'
import { taxScreens } from './screens'

/**
 * Tax Module Definition.
 * Handles configuration for the taxation subdomain.
 */
export const taxModule: BusinessDomain = {
  id: 'tax',
  name: 'Taxation',
  category: 'business',
  routes: taxRoutes,
  screens: taxScreens,
  permissions: ['finance:tax:view'],
  menuItems: [
    {
      label: 'Tax Rules',
      route: 'TaxRulesList',
      icon: 'percent',
    },
    {
      label: 'Tax Groups',
      route: 'TaxGroupsList',
      icon: 'layout-grid',
    },
  ],
}
