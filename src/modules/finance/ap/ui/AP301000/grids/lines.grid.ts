import { createColumnHelper } from '@tanstack/vue-table'
import type { VendorBillLine } from '../../../models/ap.types'

const helper = createColumnHelper<VendorBillLine>()

/**
 * AP301000 — Expense Lines Grid Definition
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
  helper.accessor('lineType', {
    header: 'Type',
    cell: (info) => info.getValue(),
    size: 100,
  }),
  helper.accessor('accountId', {
    header: 'GL Account',
    cell: (info) => info.getValue() ?? 'Not assigned',
  }),
  helper.accessor('categoryId', {
    header: 'Category',
    cell: (info) => info.getValue() ?? 'Not assigned',
  }),
  helper.accessor('whtAmount', {
    header: 'WHT',
    cell: (info) => (info.getValue() ? info.getValue()?.format('en-ET') : '—'),
    meta: { align: 'right' },
  }),
]
