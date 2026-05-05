<script setup lang="ts">
import { h, ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton, AppBadge } from '@/shared/components/primitives'
import { Users as UsersIcon, UserPlus, ShieldAlert } from 'lucide-vue-next'
import { useUsers } from '../../application/useUsers'
import type { User } from '../../domain/user.types'
import UserRoleAssignmentDialog from '../components/UserRoleAssignmentDialog.vue'
import UserInviteDialog from '../components/UserInviteDialog.vue'

const { users, isPending } = useUsers()
const gridState = useDataGrid()

const isAssignmentOpen = ref(false)
const selectedUser = ref<User | null>(null)
const isInviteOpen = ref(false)

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

function handleRowClick(user: User) {
  selectedUser.value = user
  isAssignmentOpen.value = true
}
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <UsersIcon class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Users & Access
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Manage tenant user accounts and bind them to restricted boundaries.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" @click="isInviteOpen = true">
          <UserPlus :size="14" class="mr-2" />
          Invite User
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        :data="users || []"
        :columns="userColumns"
        :loading="isPending"
        :state="gridState"
        empty-message="No active users found in this tenant."
        @row-click="handleRowClick"
      >
        <template #empty-action>
          <AppButton class="mt-4" @click="isInviteOpen = true">
            <UserPlus :size="14" class="mr-2" />
            Invite First User
          </AppButton>
        </template>
      </DataGrid>
    </div>

    <UserRoleAssignmentDialog v-model:open="isAssignmentOpen" :user="selectedUser" />
    <UserInviteDialog v-model:open="isInviteOpen" />
  </div>
</template>
