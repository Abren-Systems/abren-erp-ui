import type { FieldDefinition } from '@/platform/field-system/field-definition.types'

/**
 * Fields for the GL503000 Process Header.
 */
export const GL503000_FIELDS = {
  action: {
    key: 'action',
    label: 'Action',
    placeholder: 'Select Action...',
  } as unknown as FieldDefinition<unknown, string>,
  fiscalYear: {
    key: 'fiscalYear',
    label: 'Fiscal Year',
    placeholder: 'Select Year...',
  } as unknown as FieldDefinition<unknown, string>,
} as const
