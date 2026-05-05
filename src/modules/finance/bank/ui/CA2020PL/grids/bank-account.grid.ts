import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { BankAccount } from '../../../domain/bank.types'
import { AppBadge } from '@/shared/components/primitives'

export const accountColumns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: 'accountName',
    header: 'Account Name',
  },
  {
    accessorKey: 'accountNumber',
    header: 'Account Number',
  },
  {
    accessorKey: 'bankName',
    header: 'Bank',
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => {
      const balance = row.getValue('balance') as any
      return balance?.amount
    },
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
    cell: ({ row }) => {
      const currency = row.getValue('currency') as any
      return currency?.code
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return h(AppBadge, { variant: status === 'ACTIVE' ? 'success' : 'neutral' }, () => status)
    },
  },
]
