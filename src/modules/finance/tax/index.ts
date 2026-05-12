import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'
import { taxScreens } from './screens'

export const taxModule: BusinessDomain = {
  id: 'tax',
  name: 'Taxes',
  category: 'business',
  screens: taxScreens,
  routes,
  permissions: ['finance:tax:view'],
  icon: 'calculator',
}
