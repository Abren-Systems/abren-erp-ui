import { createColumnHelper } from '@tanstack/vue-table'
import type { VendorBillLine } from '../../../domain/ap.types'

const helper = createColumnHelper<VendorBillLine>()

/**
 * AP302000 — Expense Lines Grid Definition
 */
export const vendorBillLineColumns = [
  helper.accessor('description', {
    header: 'Description',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('amount', {
    header: 'Amount',
    cell: (info) => info.getValue().format('en-ET'),
    meta: { align: 'right' },
  }),
  helper.accessor('accountId', {
    header: 'GL Account',
    cell: (info) => info.getValue() ?? 'Not assigned',
  }),
  helper.accessor('categoryId', {
    header: 'Category',
    cell: (info) => info.getValue() ?? 'Not assigned',
  }),
]
