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
]

export default routes
