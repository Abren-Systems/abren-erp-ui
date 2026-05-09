import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { FiscalYear } from '../../domain/fiscal-calendar.types'

export const GL201000_Generate_Fields = {
  year: {
    key: 'year',
    label: 'Fiscal Year',
    type: 'text',
  } as FieldDefinition<FiscalYear, string>,

  startDate: {
    key: 'startDate',
    label: 'Start Date',
    type: 'date',
  } as FieldDefinition<FiscalYear, Date>,

  endDate: {
    key: 'endDate',
    label: 'End Date',
    type: 'date',
  } as FieldDefinition<FiscalYear, Date>,
} as const
