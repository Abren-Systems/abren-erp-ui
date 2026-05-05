import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { Account } from '../../domain/account.types'

export const GL201000_FIELDS = {
  code: {
    key: 'code',
    label: 'Account Code',
    type: 'text',
    required: () => true,
  },
  name: {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: () => true,
  },
  type: {
    key: 'type',
    label: 'Type',
    type: 'text',
    required: () => true,
  },
  isActive: {
    key: 'isActive',
    label: 'Active',
    type: 'checkbox',
  },
  currency: {
    key: 'currency',
    label: 'Currency',
    type: 'text',
  },
} satisfies Record<string, FieldDefinition<Account>>
