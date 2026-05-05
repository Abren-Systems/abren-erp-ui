import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { Warehouse } from '../../domain/inventory.types'

export const IN204000_FIELDS = {
  code: {
    key: 'code',
    label: 'Warehouse Code',
    type: 'text',
    required: () => true,
  },
  name: {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: () => true,
  },
  isQuarantine: {
    key: 'isQuarantine',
    label: 'Quarantine Area',
    type: 'checkbox',
  },
  isActive: {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
  },
} satisfies Record<string, FieldDefinition<Warehouse>>
