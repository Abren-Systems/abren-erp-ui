<script setup lang="ts">
import { h, ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { useUsers } from '../../application/composables/useUsers'
import type { User } from '../../domain/user.types'
import UserRoleAssignmentDialog from '../components/UserRoleAssignmentDialog.vue'

const { users, isPending } = useUsers()
const gridState = useDataGrid()

const isAssignmentOpen = ref(false)
const selectedUser = ref<User | null>(null)

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
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    },
  },
]

function handleRowClick(user: User) {
  selectedUser.value = user
  isAssignmentOpen.value = true
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

    <UserRoleAssignmentDialog v-model:open="isAssignmentOpen" :user="selectedUser" />
  </div>
</template>
