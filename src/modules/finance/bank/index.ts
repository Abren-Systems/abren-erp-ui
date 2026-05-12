import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'
import { bankScreens } from './screens'

export const bankModule: BusinessDomain = {
  id: 'bank',
  name: 'Banking',
  category: 'business',
  screens: bankScreens,
  routes,
  permissions: ['bank:view'],
  icon: 'landmark',
}
