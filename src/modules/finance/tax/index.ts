import type { BusinessDomain } from '@/shared/types/module.types'
import { taxRoutes } from './routes'

// Domain exports
// export * from './domain/tax.types';

// Application exports
// export * from './application/useTaxRules';

// UI exports
export * from './routes'

export const taxModule: BusinessDomain = {
  id: 'tax',
  name: 'Taxation',
  category: 'business',
  routes: taxRoutes,
  permissions: ['finance:tax:view'],
  menuItems: [
    {
      label: 'Tax Rules',
      route: 'finance.tax.rules',
      icon: 'percent',
    },
  ],
}
