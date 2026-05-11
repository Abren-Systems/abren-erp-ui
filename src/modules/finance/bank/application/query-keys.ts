/**
 * Query Key Factory for Bank Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
import type { BankAccountId } from '@/shared/types/brand.types'

export const bankKeys = {
  all: ['bank'] as const,
  accounts: (query?: unknown) => [...bankKeys.all, 'accounts', query] as const,
  transactions: (accountId: BankAccountId, query?: unknown) =>
    [...bankKeys.all, 'transactions', accountId, query] as const,
  scheduledPayments: (query?: unknown) => [...bankKeys.all, 'scheduled-payments', query] as const,
}
