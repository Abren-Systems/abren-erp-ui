import { Currency } from '@/core/domain/currency'
import { Money } from '@/core/domain/money'

/**
 * Account Domain Type
 *
 * Plain-object representation of a ledger account.
 * Vue-native and fully reactive.
 */
export interface Account {
  id: string
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
