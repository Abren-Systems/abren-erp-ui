import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'coa',
    name: 'LedgerCoa',
    component: () => import('./ui/pages/ChartOfAccountsPage.vue'),
  },
  {
    path: 'journals',
    name: 'LedgerJournals',
    component: () => import('./ui/pages/JournalEntriesPage.vue'),
  },
  {
    path: 'fiscal-periods',
    name: 'LedgerFiscalPeriods',
    component: () => import('./ui/pages/FiscalPeriodsPage.vue'),
  },
  {
    path: 'settings',
    name: 'LedgerSettings',
    component: () => import('./ui/pages/LedgerSettingsPage.vue'),
  },
]

export default routes
