import { Currency } from '@/shared/domain/money'
import { Money } from '@/shared/domain/money'
import type { AccountId } from '@/shared/types/brand.types'

/**
 * Account Domain Type
 *
 * Plain-object representation of a ledger account.
 * Vue-native and fully reactive.
 */
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  // TODO: Expand with CONTRA_ASSET, COST_OF_GOODS_SOLD etc. when backend supports it
}

export interface Account {
  id: AccountId
  code: string
  name: string
  type: AccountType
  currency?: Currency // Optional if not provided by backend
  isActive: boolean
  balance: Money
}

/**
 * Account Summary Type (Optimized for Grids)
 */
export interface AccountSummary extends Account {
  // Add derived properties if needed for summary
  hasJournalEntries: boolean
}
