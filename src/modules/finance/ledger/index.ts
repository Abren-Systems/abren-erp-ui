import type { BusinessDomain } from '@/shared/types/module.types'
import routes from './routes'

export const ledgerModule: BusinessDomain = {
  id: 'ledger',
  name: 'General Ledger',
  category: 'business',
  routes,
  permissions: ['ledger:view', 'ledger:create_entry', 'ledger:post', 'ledger:manage_accounts'],
  menuItems: [
    { label: 'Chart of Accounts', route: 'LedgerCoa', icon: 'book-open' },
    { label: 'Journal Entries', route: 'LedgerJournals', icon: 'file-text' },
    { label: 'Fiscal Periods', route: 'LedgerFiscalPeriods', icon: 'calendar' },
    { label: 'Settings', route: 'LedgerSettings', icon: 'settings' },
  ],
}
