/**
 * Query Key Factory for Bank Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
import type { BankAccountId } from '@/shared/types/brand.types'

export const bankKeys = {
  all: ['bank'] as const,
  accounts: () => [...bankKeys.all, 'accounts'] as const,
  transactions: (accountId: BankAccountId) => [...bankKeys.all, 'transactions', accountId] as const,
}
