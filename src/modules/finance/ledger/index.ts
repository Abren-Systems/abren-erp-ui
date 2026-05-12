import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'
import { ledgerScreens } from './screens'

export const ledgerModule: BusinessDomain = {
  id: 'ledger',
  name: 'General Ledger',
  category: 'business',
  screens: ledgerScreens,
  routes,
  permissions: ['ledger:view', 'ledger:create_entry', 'ledger:post', 'ledger:manage_accounts'],
  icon: 'book-open',
}
