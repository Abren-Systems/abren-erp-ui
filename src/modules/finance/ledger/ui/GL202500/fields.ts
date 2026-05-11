import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { Account } from '../../models/account.types'

export const GL202500_FIELDS = {
  code: {
    key: 'code',
    label: 'Account Code',
    type: 'text',
  },
  name: {
    key: 'name',
    label: 'Name',
    type: 'text',
  },
  type: {
    key: 'type',
    label: 'Type',
    type: 'text',
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
