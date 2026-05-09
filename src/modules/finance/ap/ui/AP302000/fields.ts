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
  },
  billNumber: {
    key: 'billNumber',
    label: 'Bill Number',
    type: 'text',
  },
  vendorInvoiceNumber: {
    key: 'vendorInvoiceNumber',
    label: 'Vendor Invoice #',
    type: 'text',
  },
  issueDate: {
    key: 'issueDate',
    label: 'Issue Date',
    type: 'date',
  },
  dueDate: {
    key: 'dueDate',
    label: 'Due Date',
    type: 'date',
  },
  currency: {
    key: 'currency',
    label: 'Currency',
    type: 'selector',
  },
  justification: {
    key: 'justification',
    label: 'Justification',
    type: 'textarea',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'text',
  },
  totalAmount: {
    key: 'totalAmount',
    label: 'Total Amount',
    type: 'amount',
  },
} satisfies Record<string, FieldDefinition<VendorBill>>
