import type { components } from '@/shared/api/generated.types'

export type TaxRuleDTO = components['schemas']['TaxRuleResponse']
export type CreateTaxRuleDTO = components['schemas']['TaxRuleCreateRequest']

// Interim type — replace with generated schema once backend exposes TaxGroup endpoints
export type TaxGroupDTO = unknown
export interface CreateTaxGroupDTO {
  name: string
  method: 'SIMPLE' | 'COMPOUND'
  rule_ids: string[]
  is_active: boolean
}

export type CalculateTaxDTO = components['schemas']['CalculateTaxRequest']
export type TaxCalculationResultDTO = components['schemas']['TaxCalculationResponse']
export type TaxCalculationResponse = TaxCalculationResultDTO
