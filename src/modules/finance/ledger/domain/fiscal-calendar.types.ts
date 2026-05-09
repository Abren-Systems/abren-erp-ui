import type { FiscalPeriodId, FiscalYearId, ValueDate } from '@/shared/types/brand.types'

export type FiscalPeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED'

export interface FiscalPeriod {
  id: FiscalPeriodId
  fiscalYearId: FiscalYearId
  name: string
  startDate: ValueDate
  endDate: ValueDate
  status: FiscalPeriodStatus
  isAdjustmentPeriod: boolean
  createdAt: string
}

export interface FiscalYear {
  id: FiscalYearId
  year: string
  startDate: ValueDate
  endDate: ValueDate
  periods: FiscalPeriod[]
  createdAt: string
}

export interface GenerateFiscalYearDTO {
  year: string
  startDate: string
  endDate: string
}
