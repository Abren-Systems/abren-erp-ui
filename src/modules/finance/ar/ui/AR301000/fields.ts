import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { ARInvoice } from '../../models/invoice.schema'

export const AR301000_FIELDS = {
  customerId: {
    key: 'customerId',
    label: 'Customer ID',
    type: 'text',
  } as FieldDefinition<ARInvoice, string>,

  date: {
    key: 'date',
    label: 'Date',
    type: 'date',
  } as FieldDefinition<ARInvoice, string>,

  currencyId: {
    key: 'currencyId',
    label: 'Currency',
    type: 'text', // In a real app this might be a 'selector'
  } as FieldDefinition<ARInvoice, string>,

  docAmount: {
    key: 'docAmount',
    label: 'Total Amount',
    type: 'amount',
  } as FieldDefinition<ARInvoice, number>,

  status: {
    key: 'status',
    label: 'Status',
    type: 'text', // status formatting is handled by semantic projection or component
  } as FieldDefinition<ARInvoice, string>,
} as const
