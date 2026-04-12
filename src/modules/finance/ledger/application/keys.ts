/**
 * Query Key Factory for Ledger Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
export const ledgerKeys = {
  all: ['ledger'] as const,
  accounts: () => [...ledgerKeys.all, 'accounts'] as const,
  account: (id: string) => [...ledgerKeys.accounts(), id] as const,
  journalEntries: () => [...ledgerKeys.all, 'journal-entries'] as const,
  journalEntry: (id: string) => [...ledgerKeys.journalEntries(), id] as const,
  settings: () => [...ledgerKeys.all, 'settings'] as const,
  fiscalPeriods: () => [...ledgerKeys.all, 'fiscal-periods'] as const,
}
