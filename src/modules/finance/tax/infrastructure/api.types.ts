import type { components } from '@/shared/api/generated.types'

export type TaxRuleDTO = components['schemas']['TaxRuleResponse']
export type TaxRuleCreateDTO = components['schemas']['TaxRuleCreateRequest']

// Temporarily falling back to unknown for missing backend types to unblock UI development
// These should be updated once the backend exposes TaxGroup schemas
export type TaxGroupDTO = unknown
export type TaxGroupCreateDTO = unknown

export type CalculateTaxRequest = components['schemas']['CalculateTaxRequest']
export type TaxCalculationResponse = components['schemas']['TaxCalculationResponse']
