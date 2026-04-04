<script setup lang="ts">
import { h } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { useUsers } from '../../application/composables/useUsers'
import type { User } from '../../domain/user.types'

const { users, isPending } = useUsers()
const gridState = useDataGrid()

const userColumns = [
  {
    accessorKey: 'email',
    header: 'Identity (Email)',
    cell: ({ row }: { row: { original: User } }) => {
      return h('div', { class: 'font-medium' }, row.original.email)
    },
  },
  {
    accessorKey: 'status',
    header: 'Account Status',
    cell: ({ row }: { row: { original: User } }) => {
      const status = row.original.status
      const variant =
        status === 'ACTIVE' ? 'default' : status === 'PENDING' ? 'outline' : 'secondary'
      return h(Badge, { variant }, () => status)
    },
  },
  {
    accessorKey: 'roles',
    header: 'Assigned Boundaries',
    cell: ({ row }: { row: { original: User } }) => {
      const roles = row.original.roles || []

      if (roles.length === 0)
        return h('span', { class: 'text-muted-foreground italic' }, 'No Access')

      return h(
        'div',
        { class: 'flex gap-1 flex-wrap' },
        roles.map((r) => h(Badge, { variant: 'secondary', class: 'text-xs' }, () => r.name)),
      )
    },
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Authorized',
    cell: ({ row }: { row: { original: User } }) => {
      const date = row.original.lastLoginAt
      if (!date) return 'Never'
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
        date,
      )
    },
  },
]

function handleRowClick(user: User) {
  console.log('Open User RBAC Assignment Sidebar for:', user.id)
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Users & Access</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Manage tenant user accounts and bind them to restricted boundaries.
        </p>
      </div>
      <Button @click="console.log('Invite User')"> Invite User </Button>
    </header>

    <DataGrid
      :data="users || []"
      :columns="userColumns"
      :loading="isPending"
      :state="gridState"
      @row-click="handleRowClick"
    />
  </div>
</template>
