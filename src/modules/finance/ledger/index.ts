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
  menuItems: [
    { label: 'Financial Year', route: 'LedgerFinancialYear', icon: 'calendar-days' },
    { label: 'Master Financial Calendar', route: 'LedgerFiscalCalendar', icon: 'calendar' },
    { label: 'Chart of Accounts', route: 'LedgerCoa', icon: 'book-open' },
    { label: 'Journal Entries', route: 'LedgerJournals', icon: 'file-text' },
    { label: 'GL Preferences', route: 'LedgerSettings', icon: 'settings' },
  ],
}
