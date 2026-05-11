import { createColumnHelper } from '@tanstack/vue-table'
import type { Account } from '../../../models/account.types'

const helper = createColumnHelper<Account>()

export const accountColumns = [
  helper.accessor('code', {
    header: 'Account Code',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('type', {
    header: 'Type',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('isActive', {
    header: 'Status',
    cell: (info) => (info.getValue() ? 'Active' : 'Inactive'),
  }),
  helper.accessor('currency', {
    header: 'Currency',
    cell: (info) => info.getValue() || '—',
  }),
]
