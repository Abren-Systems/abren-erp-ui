import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'coa',
    name: 'LedgerCoa',
    component: () => import('./ui/accounts/pages/ChartOfAccountsListPage.vue'),
  },
  {
    path: 'journals',
    name: 'LedgerJournals',
    component: () => import('./ui/journal-entries/pages/JournalEntriesListPage.vue'),
  },
  {
    path: 'fiscal-periods',
    name: 'LedgerFiscalPeriods',
    component: () => import('./ui/fiscal-periods/pages/FiscalPeriodsListPage.vue'),
  },
  {
    path: 'settings',
    name: 'LedgerSettings',
    component: () => import('./ui/settings/pages/LedgerSettingsPage.vue'),
  },
]

export default routes
