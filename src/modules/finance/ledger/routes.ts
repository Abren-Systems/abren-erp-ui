import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // ── Chart of Accounts ────────────────────────────────────────
  {
    path: 'coa',
    name: 'LedgerCoa',
    component: () => import('./ui/GL2010PL/view.vue'),
    meta: { permission: 'ledger:view' },
  },
  {
    path: 'coa/:id',
    name: 'LedgerCoaDetail',
    component: () => import('./ui/GL201000/view.vue'),
    meta: { permission: 'ledger:view' },
    props: true,
  },

  // ── Journal Entries ──────────────────────────────────────────
  {
    path: 'journals',
    name: 'LedgerJournals',
    component: () => import('./ui/GL3010PL/view.vue'),
    meta: { permission: 'ledger:view' },
  },
  {
    path: 'journals/:id',
    name: 'LedgerJournalDetail',
    component: () => import('./ui/GL301000/view.vue'),
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
