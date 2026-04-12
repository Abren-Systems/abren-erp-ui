import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // ── Chart of Accounts ────────────────────────────────────────
  {
    path: 'coa',
    name: 'LedgerCoa',
    component: () => import('./ui/accounts/pages/ChartOfAccountsListPage.vue'),
    meta: { permission: 'ledger:view' },
  },
  {
    path: 'coa/:accountId',
    name: 'LedgerCoaDetail',
    component: () => import('./ui/accounts/pages/ChartOfAccountsDetailPage.vue'),
    meta: { permission: 'ledger:view' },
    props: true,
  },

  // ── Journal Entries ──────────────────────────────────────────
  {
    path: 'journals',
    name: 'LedgerJournals',
    component: () => import('./ui/journal-entries/pages/JournalEntriesListPage.vue'),
    meta: { permission: 'ledger:view' },
  },
  {
    path: 'journals/:entryId',
    name: 'LedgerJournalDetail',
    component: () => import('./ui/journal-entries/pages/JournalEntryDetailPage.vue'),
    meta: { permission: 'ledger:view' },
    props: true,
  },

  // ── Fiscal Periods ───────────────────────────────────────────
  {
    path: 'fiscal-periods',
    name: 'LedgerFiscalPeriods',
    component: () => import('./ui/fiscal-periods/pages/FiscalPeriodsListPage.vue'),
    meta: { permission: 'ledger:view' },
  },

  // ── Settings ─────────────────────────────────────────────────
  {
    path: 'settings',
    name: 'LedgerSettings',
    component: () => import('./ui/settings/pages/LedgerSettingsPage.vue'),
    meta: { permission: 'ledger:manage_accounts' },
  },
]

export default routes
