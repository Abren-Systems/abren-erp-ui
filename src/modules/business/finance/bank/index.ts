import type { BusinessDomain } from '@/core/types/module.types'

export const bankModule: BusinessDomain = {
  id: 'bank',
  name: 'Banking',
  category: 'business',
  routes: () => import('./routes').then((m) => m.default),
  permissions: ['bank.view'],
  menuItems: [{ label: 'Accounts', route: 'BankAccountsList', icon: 'landmark' }],
}
