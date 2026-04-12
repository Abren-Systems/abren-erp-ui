import type { TaxRuleDTO, TaxCalculationResponse } from './api.types'
import type { TaxRule, TaxCalculationResult, TaxType } from '../domain/tax.types'
import { CommonMapper } from '@/shared/infrastructure/mappers'
import type { TaxRuleId, AccountId } from '@/shared/types/brand.types'

export class TaxMapper {
  static toTaxRule(dto: TaxRuleDTO): TaxRule {
    return {
      id: CommonMapper.toBrandedId<TaxRuleId>(dto.id),
      name: dto.name,
      rate: Number(dto.rate),
      taxType: dto.tax_type as TaxType,
      glAccountId: CommonMapper.toBrandedId<AccountId>(dto.gl_account_id),
      isActive: dto.is_active,
    }
  }

  static toCalculationResult(dto: TaxCalculationResponse): TaxCalculationResult {
    return {
      net: CommonMapper.toMoney(dto.net, dto.currency),
      tax: CommonMapper.toMoney(dto.tax, dto.currency),
      gross: CommonMapper.toMoney(dto.gross, dto.currency),
    }
  }
}
