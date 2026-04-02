/**
 * Query Key Factory for Bank Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
export const bankKeys = {
  all: ['bank'] as const,
  accounts: () => [...bankKeys.all, 'accounts'] as const,
  transactions: (accountId: string) => [...bankKeys.all, 'transactions', accountId] as const,
}
