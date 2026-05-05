import type { ColumnDef } from '@tanstack/vue-table'

// Mocking Adjustment since it's not in domain types
export interface Adjustment {
  id: string
  warehouseId: string
  reason: string
  date: string
}

export const adjustmentColumns: ColumnDef<Adjustment>[] = [
  {
    accessorKey: 'id',
    header: 'Adjustment ID',
  },
  {
    accessorKey: 'warehouseId',
    header: 'Warehouse ID',
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
]
