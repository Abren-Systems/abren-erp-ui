<script setup lang="ts">
import { h, ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { useRoles } from '../../application/composables/useRoles'
import type { Role } from '../../domain/user.types'
import CreateRoleDialog from '../components/CreateRoleDialog.vue'

const { roles, isRolesPending } = useRoles()
const gridState = useDataGrid()

const isCreateOpen = ref(false)

const roleColumns = [
  {
    accessorKey: 'name',
    header: 'Role Identity',
    cell: ({ row }: { row: { original: Role } }) => {
      return h('div', { class: 'font-medium' }, [
        row.original.name,
        row.original.isSystem
          ? h(Badge, { variant: 'secondary', class: 'ml-2 text-xs' }, () => 'System Protected')
          : null,
      ])
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'permissions',
    header: 'Access Scope (Permissions)',
    cell: ({ row }: { row: { original: Role } }) => {
      // Just show the first 3 permissions to avoid massive table row wrapping
      const perms = row.original.permissions || []
      const display = perms.slice(0, 3)
      const remainder = perms.length - 3

      const chips = display.map((p: string) =>
        h(Badge, { variant: 'outline', class: 'mr-1 mb-1 font-mono text-[10px]' }, () => p),
      )

      if (remainder > 0) {
        chips.push(
          h(Badge, { variant: 'default', class: 'text-[10px]' }, () => `+${remainder} more`),
        )
      }

      if (chips.length === 0)
        return h('span', { class: 'text-muted-foreground' }, 'No Boundaries Defined')

      return h('div', { class: 'flex flex-wrap' }, chips)
    },
  },
]

function handleRowClick(role: Role) {
  // Navigation for a future side-bar editor
  console.log('Open Role Matrix Sidebar for:', role.id)
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Identity Roles</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Manage system boundaries and custom multi-tenant permission matrices.
        </p>
      </div>
      <Button @click="isCreateOpen = true"> Define Boundary </Button>
    </header>

    <DataGrid
      :data="roles || []"
      :columns="roleColumns"
      :loading="isRolesPending"
      :state="gridState"
      @row-click="handleRowClick"
    />

    <CreateRoleDialog v-model:open="isCreateOpen" />
  </div>
</template>
