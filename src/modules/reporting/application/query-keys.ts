import type { CashflowQuery } from '../infrastructure/api.types'

/**
 * Query Key Factory for Reporting Module
 *
 * Centralized source of truth for TanStack Query keys.
 */
export const reportingKeys = {
  all: ['reporting'] as const,
  cashflow: (query: CashflowQuery) => [...reportingKeys.all, 'cashflow', query] as const,
}
