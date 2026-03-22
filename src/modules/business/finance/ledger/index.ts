import type { ModuleDefinition } from '@/core/types/module.types'

export const ledgerModule: ModuleDefinition = {
  id: 'ledger',
  name: 'General Ledger',
  category: 'business',
  routes: () => import('./routes').then(m => m.default),
  permissions: ['ledger.view', 'ledger.edit'],
  menuItems: [
    { label: 'Chart of Accounts', route: 'LedgerCoa', icon: 'book-open' },
    { label: 'Journal Entries', route: 'LedgerEntries', icon: 'file-text' },
  ],
}
