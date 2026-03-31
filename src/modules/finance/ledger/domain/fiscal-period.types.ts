export type FiscalPeriodId = string & { readonly __brand: 'FiscalPeriodId' }

export type FiscalPeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED'

export interface FiscalPeriod {
  id: FiscalPeriodId
  name: string
  startDate: string
  endDate: string
  status: FiscalPeriodStatus
  isAdjustmentPeriod: boolean
  createdAt: string
}
