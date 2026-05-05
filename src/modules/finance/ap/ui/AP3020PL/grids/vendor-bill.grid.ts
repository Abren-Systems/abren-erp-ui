import { createColumnHelper } from '@tanstack/vue-table'
import type { VendorBill } from '../../../domain/ap.types'

const helper = createColumnHelper<VendorBill>()

export const vendorBillColumns = [
  helper.accessor('billNumber', {
    header: 'Bill Number',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('vendorId', {
    header: 'Vendor',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('issueDate', {
    header: 'Date',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('totalAmount', {
    header: 'Total Amount',
    cell: (info) => info.getValue().format('en-ET'),
    meta: { align: 'right' },
  }),
]
