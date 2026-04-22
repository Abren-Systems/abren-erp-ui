import type { TaxRuleDTO, TaxCalculationResponse, TaxGroupDTO } from './api.types'
import type {
  TaxRule,
  TaxCalculationResult,
  TaxType,
  TaxGroup,
  TaxDirection,
  CalculationMethod,
} from '../domain/tax.types'
import { CommonMapper } from '@/shared/infrastructure/mappers'
import type { TaxRuleId, AccountId, TaxGroupId } from '@/shared/types/brand.types'

export class TaxMapper {
  static toTaxRule(dto: TaxRuleDTO): TaxRule {
    return {
      id: CommonMapper.toBrandedId<TaxRuleId>(dto.id),
      name: dto.name,
      rate: Number(dto.rate),
      taxType: dto.tax_type as TaxType,
      // Default to NON_DIRECTIONAL if backend doesn't provide direction
      direction: ((dto as unknown as Record<string, unknown>)['direction'] ||
        'NON_DIRECTIONAL') as TaxDirection,
      glAccountId: CommonMapper.toBrandedId<AccountId>(dto.gl_account_id),
      isActive: dto.is_active,
    }
  }

  static toTaxGroup(dto: TaxGroupDTO): TaxGroup {
    const rawDto = dto as unknown as Record<string, unknown>
    return {
      id: CommonMapper.toBrandedId<TaxGroupId>(rawDto['id'] as string),
      name: (rawDto['name'] as string) || '',
      method: (rawDto['method'] as CalculationMethod) || 'SIMPLE',
      ruleIds: ((rawDto['rule_ids'] as string[]) || []).map((id: string) =>
        CommonMapper.toBrandedId<TaxRuleId>(id),
      ),
      rules: (rawDto['rules'] as TaxRuleDTO[])?.map((r: TaxRuleDTO) => TaxMapper.toTaxRule(r)),
      isActive: (rawDto['is_active'] as boolean) || false,
    }
  }

  static toCalculationResult(dto: TaxCalculationResponse): TaxCalculationResult {
    const result: TaxCalculationResult = {
      net: CommonMapper.toMoney(dto.net, dto.currency),
      tax: CommonMapper.toMoney(dto.tax, dto.currency),
      gross: CommonMapper.toMoney(dto.gross, dto.currency),
    }

    const rawDto = dto as unknown as Record<string, unknown>
    if (rawDto['breakdown']) {
      result.breakdown = {}
      for (const [key, value] of Object.entries(rawDto['breakdown'] as Record<string, unknown>)) {
        result.breakdown[key] = CommonMapper.toMoney(value as string | number, dto.currency)
      }
    }

    return result
  }
}
