import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'

export const bankModule: BusinessDomain = {
  id: 'bank',
  name: 'Banking',
  category: 'business',
  routes,
  permissions: ['bank.view'],
  menuItems: [{ label: 'Accounts', route: 'BankAccountsList', icon: 'landmark' }],
}
