import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { TaxRule } from '../../domain/tax.types'

export const TX202000_FIELDS = {
  name: {
    key: 'name',
    label: 'Rule Name',
    type: 'text',
    required: () => true,
  },
  rate: {
    key: 'rate',
    label: 'Rate',
    type: 'number',
    required: () => true,
  },
  taxType: {
    key: 'taxType',
    label: 'Tax Type',
    type: 'selector',
    required: () => true,
  },
  direction: {
    key: 'direction',
    label: 'Direction',
    type: 'selector',
    required: () => true,
  },
  glAccountId: {
    key: 'glAccountId',
    label: 'GL Account',
    type: 'selector',
    required: () => true,
  },
  isActive: {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
  },
} satisfies Record<string, FieldDefinition<TaxRule>>
