import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { TaxGroup } from '../../domain/tax.types'

export const TX201000_FIELDS = {
  name: {
    key: 'name',
    label: 'Group Name',
    type: 'text',
    required: () => true,
  },
  method: {
    key: 'method',
    label: 'Calculation Method',
    type: 'selector',
    required: () => true,
  },
  isActive: {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
  },
} satisfies Record<string, FieldDefinition<TaxGroup>>
