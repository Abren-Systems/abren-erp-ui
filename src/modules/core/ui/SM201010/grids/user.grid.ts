import { createColumnHelper } from '@tanstack/vue-table'
import type { User } from '../../../domain/user.types'

const helper = createColumnHelper<User>()

export const userColumns = [
  helper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('roles', {
    header: 'Roles',
    cell: (info) => {
      const roles = info.getValue()
      return roles.length > 0 ? roles.map((r) => r.name).join(', ') : 'None'
    },
  }),
]
