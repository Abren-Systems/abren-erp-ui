import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { TaxGroup } from '../../../domain/tax.types'
import { AppBadge } from '@/shared/components/primitives'

/**
 * Grid definition for Tax Groups.
 */
export const taxGroupColumns: ColumnDef<TaxGroup>[] = [
  {
    accessorKey: 'name',
    header: 'Group Name',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'method',
    header: 'Calculation Method',
    cell: ({ row }) => {
      const method = row.getValue('method') as string
      return h(AppBadge, { variant: method === 'COMPOUND' ? 'primary' : 'neutral' }, () => method)
    },
  },
  {
    accessorKey: 'ruleIds',
    header: 'Rules Count',
    cell: ({ row }) => {
      const ruleIds = row.getValue('ruleIds') as string[]
      return ruleIds.length.toString()
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return h(AppBadge, { variant: isActive ? 'success' : 'danger' }, () =>
        isActive ? 'Active' : 'Inactive',
      )
    },
  },
]
