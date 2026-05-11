import { Money } from '@/shared/domain/money'
import type { IsoDate } from '@/shared/domain/business-date'

/**
 * Daily Cashflow Entry (Domain Model).
 *
 * Represents the net cash movement for a single day,
 * including actual and projected figures.
 */
export interface DailyCashflowEntry {
  date: IsoDate
  actualInflow: Money
  actualOutflow: Money
  projectedInflow: Money
  projectedOutflow: Money
  netCashflow: Money
}

/**
 * Aggregated Cashflow Stats for UI display.
 */
export interface CashflowStats {
  totalActualInflow: Money
  totalActualOutflow: Money
  projectedExposure: Money
  netCashPosition: Money
}
