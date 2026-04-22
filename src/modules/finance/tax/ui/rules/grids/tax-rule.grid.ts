import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { TaxRule } from '../../../domain/tax.types'
import { AppBadge } from '@/shared/components/primitives'

/**
 * Grid definition for Tax Rules.
 * Displays rule metadata and statutory directionality.
 */
export const taxRuleColumns: ColumnDef<TaxRule>[] = [
  {
    accessorKey: 'name',
    header: 'Rule Name',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'taxType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('taxType') as string
      return h(AppBadge, { variant: type === 'VAT' ? 'primary' : 'neutral' }, () => type)
    },
  },
  {
    accessorKey: 'direction',
    header: 'Direction',
    cell: ({ row }) => {
      const direction = row.getValue('direction') as string
      let variant: 'primary' | 'success' | 'neutral' = 'neutral'
      if (direction === 'INPUT') variant = 'success'
      if (direction === 'OUTPUT') variant = 'primary'

      return h(AppBadge, { variant }, () => direction)
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
    accessorKey: 'glAccountId',
    header: 'GL Account',
    cell: ({ row }) => h('code', { class: 'text-xs' }, row.getValue('glAccountId')),
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
