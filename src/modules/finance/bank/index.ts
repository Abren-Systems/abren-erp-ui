import type { BusinessDomain } from '@/shared/types/module.types'
import { bankRoutes } from './routes'
import { bankScreens } from './screens'

export const bankModule: BusinessDomain = {
  id: 'bank',
  name: 'Banking',
  category: 'business',
  routes: bankRoutes,
  screens: bankScreens,
  permissions: ['bank:view'],
  menuItems: [{ label: 'Accounts', route: 'finance.bank.accounts', icon: 'landmark' }],
}
