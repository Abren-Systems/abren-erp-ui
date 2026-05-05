import type { FieldDefinition } from '@/platform/field-system/field-definition.types'
import type { VendorBill } from '../../domain/ap.types'

/**
 * AP302000 — Field Registry Bindings
 */
export const AP302000_FIELDS = {
  vendorId: {
    key: 'vendorId',
    label: 'Vendor',
    type: 'selector',
    required: () => true,
  },
  billNumber: {
    key: 'billNumber',
    label: 'Bill Number',
    type: 'text',
    readonly: () => true,
  },
  vendorInvoiceNumber: {
    key: 'vendorInvoiceNumber',
    label: 'Vendor Invoice #',
    type: 'text',
    required: () => true,
  },
  issueDate: {
    key: 'issueDate',
    label: 'Issue Date',
    type: 'date',
    required: () => true,
  },
  dueDate: {
    key: 'dueDate',
    label: 'Due Date',
    type: 'date',
    required: () => true,
  },
  currency: {
    key: 'currency',
    label: 'Currency',
    type: 'selector',
    required: () => true,
  },
  justification: {
    key: 'justification',
    label: 'Justification',
    type: 'textarea',
    required: () => true,
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'text',
    readonly: () => true,
  },
  totalAmount: {
    key: 'totalAmount',
    label: 'Total Amount',
    type: 'amount',
    readonly: () => true,
  },
} satisfies Record<string, FieldDefinition<VendorBill>>
