import type { TaxRuleId, AccountId } from '@/shared/types/brand.types'
import type { Money } from '@/shared/domain/money'

export type TaxType = 'VAT' | 'WHT'

export interface TaxRule {
  id: TaxRuleId
  name: string
  rate: number // Stored as a JS number for UI convenience, but math should be done in API
  taxType: TaxType
  glAccountId: AccountId
  isActive: boolean
}

export interface TaxCalculationResult {
  net: Money
  tax: Money
  gross: Money
}
