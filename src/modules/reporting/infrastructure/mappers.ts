import { Money } from '@/shared/domain/money'
import { Currency } from '@/shared/domain/currency'
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
      date: new Date(dto.date),
      actualInflow: Money.from(dto.total_inflow, currency),
      actualOutflow: Money.from(dto.total_outflow, currency),
      projectedInflow: Money.from(dto.projected_inflow, currency),
      projectedOutflow: Money.from(dto.projected_outflow, currency),
      netCashflow: Money.from(dto.net_cashflow, currency),
    }
  }
}
