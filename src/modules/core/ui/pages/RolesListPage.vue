<script setup lang="ts">
import { h, ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton, AppBadge, AppSidePane } from '@/shared/components/primitives'
import { Shield, ShieldPlus, ShieldCheck } from 'lucide-vue-next'
import { useRoles } from '../../application/useRoles'
import type { Role } from '../../domain/user.types'
import RoleCreateDialog from '../components/RoleCreateDialog.vue'

const { roles, isRolesPending } = useRoles()
const gridState = useDataGrid()

const isCreateOpen = ref(false)
const isDetailOpen = ref(false)
const selectedRole = ref<Role | null>(null)

const roleColumns = [
  {
    accessorKey: 'name',
    header: 'Role Identity',
    cell: ({ row }: { row: { original: Role } }) => {
      return h('div', { class: 'font-medium flex items-center gap-2' }, [
        row.original.name,
        row.original.isSystem ? h(AppBadge, { variant: 'info' }, () => 'System') : null,
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
        h(AppBadge, { variant: 'neutral' }, () => p.toLowerCase()),
      )

      if (remainder > 0) {
        chips.push(h(AppBadge, { variant: 'neutral' }, () => `+${remainder} more`))
      }

      if (chips.length === 0)
        return h(
          'span',
          { class: 'text-[var(--color-neutral-400)] italic text-xs' },
          'No Boundaries Defined',
        )

      return h('div', { class: 'flex flex-wrap gap-1' }, chips)
    },
  },
]

function handleRowClick(role: Role) {
  selectedRole.value = role
  isDetailOpen.value = true
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
          <Shield class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Identity Roles
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Manage system boundaries and custom multi-tenant permission matrices.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" @click="isCreateOpen = true">
          <template #start>
            <ShieldPlus :size="14" />
          </template>
          Define Boundary
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        :data="roles || []"
        :columns="roleColumns"
        :loading="isRolesPending"
        :state="gridState"
        empty-message="No custom roles defined. Create functional boundaries to segregate access."
        @row-click="handleRowClick"
      >
        <template #empty-action>
          <AppButton class="mt-4" @click="isCreateOpen = true">
            <template #start>
              <ShieldPlus :size="14" />
            </template>
            Define Identity Boundary
          </AppButton>
        </template>
      </DataGrid>
    </div>

    <RoleCreateDialog v-model:open="isCreateOpen" />

    <!-- Read-Only Role Detail Pane -->
    <AppSidePane
      v-model:open="isDetailOpen"
      :title="selectedRole?.name ?? 'Role Detail'"
      description="Inspecting role boundary and permissions"
      mode="overlay"
      :show-backdrop="true"
      width="360px"
    >
      <template #icon>
        <div class="h-6 w-6 rounded-md bg-primary-50 flex items-center justify-center">
          <ShieldCheck class="h-3.5 w-3.5 text-primary-600" />
        </div>
      </template>

      <div v-if="selectedRole" class="space-y-6">
        <!-- Role Metadata -->
        <div class="space-y-4">
          <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Boundary Name
            </p>
            <p class="text-sm font-semibold text-neutral-900">{{ selectedRole.name }}</p>
          </div>

          <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Description
            </p>
            <p class="text-sm text-neutral-600">
              {{ selectedRole.description || 'No description provided.' }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <AppBadge :variant="selectedRole.isSystem ? 'info' : 'neutral'">
              {{ selectedRole.isSystem ? 'System-Defined' : 'Custom' }}
            </AppBadge>
          </div>
        </div>

        <div class="h-px bg-neutral-200" />

        <!-- Permission List (Read-Only) -->
        <div class="space-y-3">
          <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Granted Permissions ({{ selectedRole.permissions.length }})
          </p>

          <div v-if="selectedRole.permissions.length === 0" class="text-xs text-neutral-400 italic">
            No permissions assigned to this boundary.
          </div>

          <div v-else class="space-y-1.5 max-h-[400px] overflow-y-auto">
            <div
              v-for="perm in selectedRole.permissions"
              :key="perm"
              class="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100"
            >
              <div class="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              <span class="text-xs font-medium text-neutral-700">{{ perm }}</span>
            </div>
          </div>
        </div>
      </div>
    </AppSidePane>
  </div>
</template>
