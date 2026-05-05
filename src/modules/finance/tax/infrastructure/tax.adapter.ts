import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  CalculateTaxRequest,
  TaxRuleDTO,
  TaxCalculationResponse,
  TaxRuleCreateDTO,
  TaxGroupDTO,
  TaxGroupCreateDTO,
} from './api.types'
import { TaxRuleSchema, TaxCalculationResponseSchema, TaxGroupSchema } from './api.schemas'
import { TaxMapper } from './mappers'
import type { TaxRule, TaxCalculationResult, TaxGroup } from '../domain/tax.types'
import { z } from 'zod'

export const TaxAdapter = {
  /**
   * Retrieves all active tax rules from the backend.
   */
  async getActiveRules(): Promise<TaxRule[]> {
    const response = await apiGet<TaxRuleDTO[]>('/finance/tax/rules')
    const dtos = z.array(TaxRuleSchema).parse(response) as TaxRuleDTO[]
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

  /**
   * Registers a new tax rule via the backend.
   */
  async createTaxRule(dto: TaxRuleCreateDTO): Promise<TaxRule> {
    const response = await apiPost<TaxRuleDTO>('/finance/tax/rules', dto)
    const parsedDto = TaxRuleSchema.parse(response) as TaxRuleDTO
    return TaxMapper.toTaxRule(parsedDto)
  },

  /**
   * Retrieves all active tax groups from the backend.
   */
  async getActiveGroups(): Promise<TaxGroup[]> {
    const response = await apiGet<TaxGroupDTO[]>('/finance/tax/groups')
    const dtos = z.array(TaxGroupSchema).parse(response) as TaxGroupDTO[]
    return dtos.map((dto) => TaxMapper.toTaxGroup(dto))
  },

  /**
   * Registers a new tax group via the backend.
   */
  async createTaxGroup(dto: TaxGroupCreateDTO): Promise<TaxGroup> {
    const response = await apiPost<TaxGroupDTO>('/finance/tax/groups', dto)
    const parsedDto = TaxGroupSchema.parse(response) as TaxGroupDTO
    return TaxMapper.toTaxGroup(parsedDto)
  },
}
