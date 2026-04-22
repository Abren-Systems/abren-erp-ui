import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { TaxRule } from '../../../domain/tax.types'
import { Badge } from '@/shared/components/badge'

/**
 * Grid definition for Tax Rules.
 */
export const taxRuleColumns: ColumnDef<TaxRule>[] = [
  {
    accessorKey: 'name',
    header: 'Rule Name',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'tax_type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('tax_type') as string
      return h(Badge, { variant: type === 'VAT' ? 'default' : 'secondary' }, () => type)
    },
  },
  {
    accessorKey: 'rate',
    header: 'Rate',
    cell: ({ row }) => {
      const rate = Number(row.getValue('rate'))
      return `${(rate * 100).toFixed(2)}%`
    },
  },
  {
    accessorKey: 'gl_account_id',
    header: 'GL Account',
    cell: ({ row }) => h('code', { class: 'text-xs' }, row.getValue('gl_account_id')),
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean
      return h(Badge, { variant: isActive ? 'outline' : 'destructive' }, () =>
        isActive ? 'Active' : 'Inactive',
      )
    },
  },
]
