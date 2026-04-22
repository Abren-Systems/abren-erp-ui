import type { TaxRuleId, TaxGroupId, AccountId } from '@/shared/types/brand.types'
import type { Money } from '@/shared/domain/money'

export type TaxType = 'VAT' | 'WHT'

export namespace TaxType {
  export const isIndirect = (type: TaxType): boolean => type === 'VAT'
  export const isWithholding = (type: TaxType): boolean => type === 'WHT'
}

export type TaxDirection = 'INPUT' | 'OUTPUT' | 'NON_DIRECTIONAL'

export namespace TaxDirection {
  export const isDeductible = (direction: TaxDirection): boolean => direction === 'INPUT'
  export const isLiability = (direction: TaxDirection): boolean => direction === 'OUTPUT'
}
export type CalculationMethod = 'SIMPLE' | 'COMPOUND'

export interface TaxRule {
  id: TaxRuleId
  name: string
  rate: number // Stored as a JS number for UI convenience, but math should be done in API
  taxType: TaxType
  direction: TaxDirection
  glAccountId: AccountId
  isActive: boolean
}

export interface TaxGroup {
  id: TaxGroupId
  name: string
  method: CalculationMethod
  ruleIds: TaxRuleId[]
  rules?: TaxRule[]
  isActive: boolean
}

export interface TaxCalculationResult {
  net: Money
  tax: Money
  gross: Money
  breakdown?: Record<string, Money>
}
