import type { components } from '@/shared/api/generated.types'

export type TaxRuleDTO = components['schemas']['TaxRuleDTO']
export type TaxRuleCreateDTO = components['schemas']['TaxRuleCreateRequest']

// Interim type — replace with generated schema once backend exposes TaxGroup endpoints
export type TaxGroupDTO = unknown
export interface TaxGroupCreateDTO {
  name: string
  method: 'SIMPLE' | 'COMPOUND'
  rule_ids: string[]
  is_active: boolean
}

export type CalculateTaxRequest = components['schemas']['CalculateTaxRequest']
export type TaxCalculationResultDTO = components['schemas']['TaxCalculationResultDTO']
export type TaxCalculationResponse = TaxCalculationResultDTO
