import type { FieldDefinition } from '@/platform/field-system/field-definition.types'

export const GL101000_FIELDS = {
  year: {
    key: 'year',
    label: 'Fiscal Year',
    type: 'text',
    placeholder: 'e.g. 2026',
  } as unknown as FieldDefinition<unknown, string>,

  startDate: {
    key: 'startDate',
    label: 'Start Date',
    type: 'date',
  } as unknown as FieldDefinition<unknown, string>,

  endDate: {
    key: 'endDate',
    label: 'End Date',
    type: 'date',
  } as unknown as FieldDefinition<unknown, string>,
} as const
