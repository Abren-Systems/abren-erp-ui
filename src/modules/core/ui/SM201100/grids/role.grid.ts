import { createColumnHelper } from '@tanstack/vue-table'
import type { Role } from '../../../models/user.types'

const helper = createColumnHelper<Role>()

export const roleColumns = [
  helper.accessor('name', {
    header: 'Role Name',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('description', {
    header: 'Description',
    cell: (info) => info.getValue() || '—',
  }),
  helper.accessor('isSystem', {
    header: 'Type',
    cell: (info) => (info.getValue() ? 'System' : 'Custom'),
  }),
]
