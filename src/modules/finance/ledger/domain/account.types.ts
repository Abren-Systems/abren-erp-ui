import { Currency } from '@/shared/domain/money'
import { Money } from '@/shared/domain/money'
import type { AccountId } from '@/shared/types/brand.types'

/**
 * Account Domain Type
 *
 * Plain-object representation of a ledger account.
 * Vue-native and fully reactive.
 */
export interface Account {
  id: AccountId
  code: string // We'll keep it as string in domain for easier display/search
  name: string
  type: string
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
