import type { FiscalPeriodId } from '@/shared/types/brand.types'
import type { IsoDate } from '@/shared/domain/business-date'

export type FiscalPeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED'

export interface FiscalPeriod {
  id: FiscalPeriodId
  name: string
  startDate: IsoDate
  endDate: IsoDate
  status: FiscalPeriodStatus
  isAdjustmentPeriod: boolean
  createdAt: IsoDate
}
