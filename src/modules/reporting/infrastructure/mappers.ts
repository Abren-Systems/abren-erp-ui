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
    const currency = Object.values(Currency).includes(dto.currency_code as Currency)
      ? (dto.currency_code as Currency)
      : Currency.USD

    return {
      date: CommonMapper.toDate(dto.date)!,
      actualInflow: CommonMapper.toMoney(dto.total_inflow, currency),
      actualOutflow: CommonMapper.toMoney(dto.total_outflow, currency),
      projectedInflow: CommonMapper.toMoney(dto.projected_inflow, currency),
      projectedOutflow: CommonMapper.toMoney(dto.projected_outflow, currency),
      netCashflow: CommonMapper.toMoney(dto.net_cashflow, currency),
    }
  }
}
