import type { components } from '@/shared/api/generated.types'

export type TaxRuleDTO = components['schemas']['TaxRuleResponse']
export type TaxRuleCreateDTO = components['schemas']['TaxRuleCreateRequest']
export type CalculateTaxRequest = components['schemas']['CalculateTaxRequest']
export type TaxCalculationResponse = components['schemas']['TaxCalculationResponse']
