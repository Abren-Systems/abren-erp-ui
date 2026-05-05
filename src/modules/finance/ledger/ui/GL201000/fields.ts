import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { Account } from '../../domain/account.types'

export const GL201000_FIELDS = {
  code: {
    name: 'code',
    label: 'Account Code',
    type: 'text',
    required: true,
  },
  name: {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
  },
  type: {
    name: 'type',
    label: 'Type',
    type: 'text',
    required: true,
  },
  isActive: {
    name: 'isActive',
    label: 'Active',
    type: 'boolean',
  },
  currency: {
    name: 'currency',
    label: 'Currency',
    type: 'text',
  },
} satisfies Record<string, FieldDefinition<Account>>
