import type { components } from '@/shared/api/generated.types'
import type { IsoDate } from '@/shared/domain/business-date'

export type DailyCashflowDTO = components['schemas']['DailyCashflowDTO']

export interface CashflowQuery {
  startDate: IsoDate
  endDate: IsoDate
}
