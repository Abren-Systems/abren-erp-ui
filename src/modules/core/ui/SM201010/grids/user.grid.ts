import { createColumnHelper } from '@tanstack/vue-table'
import type { User } from '../../../models/user.types'
import { h } from 'vue'
import { BadgeCell } from '@/shared/components/data-grid'

const helper = createColumnHelper<User>()

export const userColumns = [
  helper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue()
      const variant = status.toLowerCase() === 'active' ? 'success' : 'neutral'
      return h(BadgeCell, { status, variant })
    },
  }),
  helper.accessor('roles', {
    header: 'Roles',
    cell: (info) => {
      const roles = info.getValue()
      return roles.length > 0 ? roles.map((r) => r.name).join(', ') : 'None'
    },
  }),
]
