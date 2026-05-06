<script setup lang="ts">
import { h, inject, computed } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppSidePane } from '@/shared/components/workspace'
import { AppButton, AppBadge } from '@/shared/components/primitives'
import { ShieldPlus, ShieldCheck } from 'lucide-vue-next'
import { useRolesController, type RolesController } from './controller'
import { ScreenControllerKey } from '@/platform/screen-runtime/injection-keys'
import RoleCreateDialog from './components/RoleCreateDialog.vue'
import type { Role } from '../../domain/user.types'

const controllerRef = inject(ScreenControllerKey)!
const controller = computed(() => controllerRef.value as RolesController)
const gridState = useDataGrid()

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
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- DataGrid Orchestration -->
    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="gridState.sorting"
        v-model:row-selection="gridState.rowSelection"
        v-model:column-visibility="gridState.columnVisibility"
        v-model:global-filter="gridState.globalFilter"
        :data="controller.data.selectGrid('roles').value as Role[]"
        :columns="roleColumns"
        :loading="controller.isLoading.value"
        placeholder="Search roles..."
        empty-message="No custom roles defined. Create functional boundaries to segregate access."
        row-clickable
        @row-click="controller.handleRowClick"
      />
    </div>

    <RoleCreateDialog v-model:open="controller.isCreateOpen.value" :controller="controller" />

    <!-- Read-Only Role Detail Pane -->
    <AppSidePane
      v-model:open="controller.isDetailOpen.value"
      :title="controller.selectedRole.value?.name ?? 'Role Detail'"
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

      <div v-if="controller.selectedRole.value" class="space-y-6">
        <!-- Role Metadata -->
        <div class="space-y-4">
          <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Boundary Name
            </p>
            <p class="text-sm font-semibold text-neutral-900">
              {{ controller.selectedRole.value.name }}
            </p>
          </div>

          <div class="space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Description
            </p>
            <p class="text-sm text-neutral-600">
              {{ controller.selectedRole.value.description || 'No description provided.' }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <AppBadge :variant="controller.selectedRole.value.isSystem ? 'info' : 'neutral'">
              {{ controller.selectedRole.value.isSystem ? 'System-Defined' : 'Custom' }}
            </AppBadge>
          </div>
        </div>

        <div class="h-px bg-neutral-200" />

        <!-- Permission List (Read-Only) -->
        <div class="space-y-3">
          <p class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Granted Permissions ({{ controller.selectedRole.value.permissions.length }})
          </p>

          <div
            v-if="controller.selectedRole.value.permissions.length === 0"
            class="text-xs text-neutral-400 italic"
          >
            No permissions assigned to this boundary.
          </div>

          <div v-else class="space-y-1.5 max-h-[400px] overflow-y-auto">
            <div
              v-for="perm in controller.selectedRole.value.permissions"
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
