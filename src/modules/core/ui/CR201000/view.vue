<script setup lang="ts">
import { h, inject, computed } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppBadge, AppButton } from '@/shared/components/primitives'
import { UserPlus } from 'lucide-vue-next'
import { useUsersController, type UsersController } from './controller'
import { ScreenControllerKey } from '@/platform/screen-runtime/injection-keys'
import UserRoleAssignmentDialog from './components/UserRoleAssignmentDialog.vue'
import UserInviteDialog from './components/UserInviteDialog.vue'
import type { User } from '../../domain/user.types'

const controllerRef = inject(ScreenControllerKey)!
const controller = computed(() => controllerRef.value as UsersController)
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
      const variant = status === 'ACTIVE' ? 'success' : status === 'PENDING' ? 'info' : 'neutral'
      return h(AppBadge, { variant }, () => status)
    },
  },
  {
    accessorKey: 'roles',
    header: 'Assigned Boundaries',
    cell: ({ row }: { row: { original: User } }) => {
      const roles = row.original.roles || []

      if (roles.length === 0)
        return h('span', { class: 'text-[var(--color-neutral-400)] italic text-xs' }, 'No Access')

      return h(
        'div',
        { class: 'flex gap-1 flex-wrap' },
        roles.map((r) => h(AppBadge, { variant: 'neutral' }, () => r.name.toLowerCase())),
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
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="gridState.sorting"
        v-model:row-selection="gridState.rowSelection"
        v-model:column-visibility="gridState.columnVisibility"
        v-model:global-filter="gridState.globalFilter"
        :data="controller.data.selectGrid('users').value as User[]"
        :columns="userColumns"
        :loading="controller.isLoading.value"
        placeholder="Search users..."
        empty-message="No active users found in this tenant."
        row-clickable
        @row-click="controller.handleRowClick"
      />
    </div>

    <UserRoleAssignmentDialog
      v-model:open="controller.isAssignmentOpen.value"
      :controller="controller"
    />
    <UserInviteDialog v-model:open="controller.isInviteOpen.value" :controller="controller" />
  </div>
</template>
