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
    // DailyCashflowDTO schema may not include currency_code explicitly in generated types,
    // but the backend might send it. Fallback to ETB or USD as per test requirements.
    const rawDto = dto as unknown as Record<string, unknown>
    const currency = (rawDto['currency_code'] as Currency) || Currency.ETB

    return {
      date: CommonMapper.toDate(dto.date)!,
      actualInflow: CommonMapper.toMoney(
        dto.inflow || (rawDto['total_inflow'] as string) || 0,
        currency,
      ),
      actualOutflow: CommonMapper.toMoney(
        dto.outflow || (rawDto['total_outflow'] as string) || 0,
        currency,
      ),
      projectedInflow: CommonMapper.toMoney((rawDto['projected_inflow'] as string) || 0, currency),
      projectedOutflow: CommonMapper.toMoney(
        (rawDto['projected_outflow'] as string) || 0,
        currency,
      ),
      netCashflow: CommonMapper.toMoney(
        dto.net_change || (rawDto['net_cashflow'] as string) || 0,
        currency,
      ),
    }
  }
}
