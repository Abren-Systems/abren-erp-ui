/**
 * Query Key Factory for Ledger Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
export const ledgerKeys = {
  all: ['ledger'] as const,
  accounts: () => [...ledgerKeys.all, 'accounts'] as const,
  journalEntries: () => [...ledgerKeys.all, 'journal-entries'] as const,
  settings: () => [...ledgerKeys.all, 'settings'] as const,
  fiscalPeriods: () => [...ledgerKeys.all, 'fiscal-periods'] as const,
}
