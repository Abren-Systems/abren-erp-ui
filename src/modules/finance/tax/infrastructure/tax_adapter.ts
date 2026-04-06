import { apiGet, apiPost } from '@/shared/api/http-client'
import type { CalculateTaxRequest, TaxRuleDTO, TaxCalculationResponse } from './api.types'
import { TaxRuleSchema, TaxCalculationResponseSchema } from './api.schemas'
import { TaxMapper } from './mappers'
import type { TaxRule, TaxCalculationResult } from '../domain/tax.types'
import { z } from 'zod'

export const TaxAdapter = {
  /**
   * Retrieves all active tax rules from the backend.
   */
  async getActiveRules(): Promise<TaxRule[]> {
    const response = await apiGet<TaxRuleDTO[]>('/finance/tax/rules')
    // Zod shielding
    const dtos = z.array(TaxRuleSchema).parse(response) as TaxRuleDTO[]
    // Mapping to pure domain
    return dtos.map((dto) => TaxMapper.toTaxRule(dto))
  },

  /**
   * Retrieves a specific tax rule by its nominal identifier.
   */
  async getRuleById(ruleId: string): Promise<TaxRule> {
    const response = await apiGet<TaxRuleDTO>(`/finance/tax/rules/${ruleId}`)
    const dto = TaxRuleSchema.parse(response) as TaxRuleDTO
    return TaxMapper.toTaxRule(dto)
  },

  /**
   * Submits a sandbox calculation payload to preview tax amounts.
   */
  async calculatePreviewTax(payload: CalculateTaxRequest): Promise<TaxCalculationResult> {
    const response = await apiPost<TaxCalculationResponse>('/finance/tax/calculate', payload)
    const dto = TaxCalculationResponseSchema.parse(response) as TaxCalculationResponse
    return TaxMapper.toCalculationResult(dto)
  },
}
