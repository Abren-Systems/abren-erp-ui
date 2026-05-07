import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { TaxGroup } from '../../domain/tax.types'

export const TX201000_FIELDS = {
  name: {
    key: 'name',
    label: 'Group Name',
    type: 'text',
    required: () => true,
  } as FieldDefinition<TaxGroup, string>,

  method: {
    key: 'method',
    label: 'Calculation Method',
    type: 'selector',
    required: () => true,
  } as FieldDefinition<TaxGroup, string>,

  isActive: {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
  } as FieldDefinition<TaxGroup, boolean>,
} as const
