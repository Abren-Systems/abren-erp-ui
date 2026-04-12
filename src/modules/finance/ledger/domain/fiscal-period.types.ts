import type { FiscalPeriodId, ValueDate } from '@/shared/types/brand.types'

export type FiscalPeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED'

export interface FiscalPeriod {
  id: FiscalPeriodId
  name: string
  startDate: ValueDate
  endDate: ValueDate
  status: FiscalPeriodStatus
  isAdjustmentPeriod: boolean
  createdAt: string
}
