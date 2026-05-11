/**
 * Query Key Factory for Ledger Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
export const ledgerKeys = {
  all: ['ledger'] as const,
  accounts: () => [...ledgerKeys.all, 'accounts'] as const,
  account: (id: string) => [...ledgerKeys.all, 'accounts', 'detail', id] as const,
  journalEntries: (query?: unknown) => [...ledgerKeys.all, 'journal-entries', query] as const,
  journalEntry: (id: string) => [...ledgerKeys.all, 'journal-entries', 'detail', id] as const,
  settings: () => [...ledgerKeys.all, 'settings'] as const,
  fiscalPeriods: () => [...ledgerKeys.all, 'fiscal-periods'] as const,
}
