import { apiGet, apiPost, apiGetEnvelope, apiPostEnvelope } from '@/shared/api/http-client'
import type {
  CalculateTaxDTO,
  TaxRuleDTO,
  TaxCalculationResultDTO,
  CreateTaxRuleDTO,
  TaxGroupDTO,
  CreateTaxGroupDTO,
} from './api.types'
import {
  TaxCalculationResponseSchema,
  OperationalTaxRuleSchema,
  OperationalTaxGroupSchema,
} from './api.schemas'
import { TaxMapper } from './mappers'
import type { TaxRule, TaxCalculationResult, TaxGroup } from '../models/tax.types'
import type {
  LightweightOperationalEntity,
  OperationalEntity,
} from '@/platform/workflow-runtime/models/workflows.types'
import {
  mapLightweightOperational,
  mapOperational,
  type OperationalDTO,
} from '@/platform/workflow-runtime/utils/operational'

export const TaxAdapter = {
  /**
   * Retrieves all active tax rules from the backend.
   */
  async getActiveRules(): Promise<LightweightOperationalEntity<TaxRule>[]> {
    const response = (await apiGet<unknown[]>('/finance/tax/rules')) as unknown[]
    return response.map((item) => {
      const parsed = OperationalTaxRuleSchema.parse(item)
      return mapLightweightOperational<TaxRuleDTO, TaxRule>(parsed, (dto) =>
        TaxMapper.toTaxRule(dto),
      )
    })
  },

  /**
   * Retrieves a specific tax rule by its nominal identifier.
   */
  async getRuleById(ruleId: string): Promise<OperationalEntity<TaxRule>> {
    const raw = await apiGetEnvelope<OperationalDTO<TaxRuleDTO>>(`/finance/tax/rules/${ruleId}`)
    return mapOperational<TaxRuleDTO, TaxRule>(raw.data, (dto) => TaxMapper.toTaxRule(dto))
  },

  /**
   * Submits a sandbox calculation payload to preview tax amounts.
   */
  async calculatePreviewTax(payload: CalculateTaxDTO): Promise<TaxCalculationResult> {
    const response = await apiPost<TaxCalculationResultDTO>('/finance/tax/calculate', payload)
    const dto = TaxCalculationResponseSchema.parse(response) as TaxCalculationResultDTO
    return TaxMapper.toCalculationResult(dto)
  },

  /**
   * Registers a new tax rule via the backend.
   */
  async createTaxRule(dto: CreateTaxRuleDTO): Promise<OperationalEntity<TaxRule>> {
    const raw = await apiPostEnvelope<OperationalDTO<TaxRuleDTO>>('/finance/tax/rules', dto)
    return mapOperational<TaxRuleDTO, TaxRule>(raw.data, (parsedDto) =>
      TaxMapper.toTaxRule(parsedDto),
    )
  },

  /**
   * Retrieves all active tax groups from the backend.
   */
  async getActiveGroups(): Promise<LightweightOperationalEntity<TaxGroup>[]> {
    const response = (await apiGet<unknown[]>('/finance/tax/groups')) as unknown[]
    return response.map((item) => {
      const parsed = OperationalTaxGroupSchema.parse(item)
      return mapLightweightOperational<TaxGroupDTO, TaxGroup>(parsed, (dto) =>
        TaxMapper.toTaxGroup(dto),
      )
    })
  },

  /**
   * Registers a new tax group via the backend.
   */
  async createTaxGroup(dto: CreateTaxGroupDTO): Promise<OperationalEntity<TaxGroup>> {
    const raw = await apiPostEnvelope<OperationalDTO<TaxGroupDTO>>('/finance/tax/groups', dto)
    return mapOperational<TaxGroupDTO, TaxGroup>(raw.data, (parsedDto) =>
      TaxMapper.toTaxGroup(parsedDto),
    )
  },

  /**
   * Retrieves a specific tax group by its identifier.
   */
  async getGroupById(groupId: string): Promise<OperationalEntity<TaxGroup>> {
    const raw = await apiGetEnvelope<OperationalDTO<TaxGroupDTO>>(`/finance/tax/groups/${groupId}`)
    return mapOperational<TaxGroupDTO, TaxGroup>(raw.data, (dto) => TaxMapper.toTaxGroup(dto))
  },
}
