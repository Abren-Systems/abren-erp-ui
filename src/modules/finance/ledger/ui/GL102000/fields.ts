import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { FiscalPeriod } from '../../domain/fiscal-period.types'

export const GL102000_Create_Fields = {
  name: {
    key: 'name',
    label: 'Period Name',
    type: 'text',
  } as FieldDefinition<FiscalPeriod, string>,

  startDate: {
    key: 'startDate',
    label: 'Start Date',
    type: 'date',
  } as FieldDefinition<FiscalPeriod, Date>,

  endDate: {
    key: 'endDate',
    label: 'End Date',
    type: 'date',
  } as FieldDefinition<FiscalPeriod, Date>,
} as const
