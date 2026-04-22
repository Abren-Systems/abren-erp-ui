import { Currency } from '@/shared/domain/money'
import { CommonMapper } from '@/shared/infrastructure/mappers'
import type { DailyCashflowDTO } from './api.types'
import type { DailyCashflowEntry } from '../domain/reporting.types'

/**
 * Reporting Mapper-as-Factory.
 *
 * Ensures the Reporting UI is never coupled to the backend's raw response shape.
 */
export class ReportingMapper {
  static toDailyCashflowEntry(dto: DailyCashflowDTO): DailyCashflowEntry {
    // DailyCashflowDTO doesn't have currency_code, it might be in a wrapper or shared.
    // For now, default to ETB or fallback logic.
    const currency = Currency.ETB

    return {
      date: CommonMapper.toDate(dto.date)!,
      actualInflow: CommonMapper.toMoney(dto.inflow, currency),
      actualOutflow: CommonMapper.toMoney(dto.outflow, currency),
      projectedInflow: CommonMapper.toMoney('0', currency), // Missing in DTO
      projectedOutflow: CommonMapper.toMoney('0', currency), // Missing in DTO
      netCashflow: CommonMapper.toMoney(dto.net_change, currency),
    }
  }
}
