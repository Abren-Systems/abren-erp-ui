import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { BankAccount } from '../../domain/bank.types'

export const CA202000_FIELDS = {
  accountName: {
    key: 'accountName',
    label: 'Account Name',
    type: 'text',
  },
  accountNumber: {
    key: 'accountNumber',
    label: 'Account Number',
    type: 'text',
  },
  bankName: {
    key: 'bankName',
    label: 'Bank Name',
    type: 'text',
  },
  currency: {
    key: 'currency',
    label: 'Currency',
    type: 'selector',
  },
  isDefault: {
    key: 'isDefault',
    label: 'Default Account',
    type: 'checkbox',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'selector',
  },
} satisfies Record<string, FieldDefinition<BankAccount>>
