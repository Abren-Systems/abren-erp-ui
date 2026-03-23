import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { PendingApproval } from '../../domain/models/workflow.types'

export const workflowColumns: ColumnDef<PendingApproval>[] = [
  {
    accessorKey: 'entityType',
    header: 'Type',
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.entityType),
  },
  {
    accessorKey: 'entityId',
    header: 'Reference',
    cell: ({ row }) => h('code', { class: 'text-xs text-neutral-500' }, row.original.entityId.slice(0, 8)),
  },
  {
    accessorKey: 'currentState',
    header: 'From',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
      h('span', { class: 'text-neutral-500' }, row.original.currentState),
      h('span', { class: 'text-neutral-300' }, '→'),
      h('span', { class: 'font-bold text-primary-600' }, row.original.targetState || '???'),
    ]),
  },
  {
    accessorKey: 'submittedAt',
    header: 'Requested On',
    cell: ({ row }) => row.original.submittedAt?.toLocaleString() || '-',
  },
]
