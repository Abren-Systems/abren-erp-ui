import type { IsoDate } from '@/shared/domain/business-date'
import { Currency } from '@/shared/domain/money'
import type { AccountId } from '@/shared/types/brand.types'

export interface LedgerSettings {
  retainedEarningsAccountId: AccountId | null
  defaultCurrency: Currency
  exchangeRateProvider: string
  isStrictPostingEnabled: boolean
  updatedAt: IsoDate
}
