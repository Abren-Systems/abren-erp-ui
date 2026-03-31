import type { AccountId } from '@/shared/types/brand.types'

export interface LedgerSettings {
  retainedEarningsAccountId: AccountId | null
  defaultCurrency: string
  exchangeRateProvider: string
  isStrictPostingEnabled: boolean
  updatedAt: string
}
