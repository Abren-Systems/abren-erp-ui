<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { ListTitleBar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { AppField } from '@/shared/components/field-system'
import { AppDialog } from '@/shared/components/workspace'
import { roleColumns } from './grids/role.grid'
import { useRolesController } from './controller'

const ctrl = useRolesController()
const gridState = useDataGrid()
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--color-neutral-50)]">
    <ListTitleBar :screen-title="ctrl.screen.titleKey" />

    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="gridState.sorting"
        v-model:row-selection="gridState.rowSelection"
        v-model:column-visibility="gridState.columnVisibility"
        v-model:global-filter="gridState.globalFilter"
        :data="ctrl.roles.value || []"
        :columns="roleColumns"
        :loading="ctrl.isLoading.value"
        placeholder="Search roles..."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton variant="primary" size="sm" @click="ctrl.commands.value['create']?.execute()">
            Add Role
          </AppButton>
        </template>
      </DataGrid>
    </div>

    <!-- Create Dialog -->
    <AppDialog
      v-model:open="ctrl.isCreateOpen.value"
      title="Create New Role"
      description="Define a new role and its associated permissions."
    >
      <div class="space-y-4 py-4">
        <AppField
          field="create-role-name"
          label="Role Name"
          type="text"
          mode="edit"
          :model-value="ctrl.createName.value"
          @update:model-value="ctrl.createName.value = $event"
          :editor-attrs="{ placeholder: 'e.g. Sales Manager' }"
        />
        <AppField
          field="create-role-description"
          label="Description"
          type="text"
          mode="edit"
          :model-value="ctrl.createDescription.value"
          @update:model-value="ctrl.createDescription.value = $event"
          :editor-attrs="{ placeholder: 'Optional...' }"
        />
        <div class="space-y-2">
          <label class="text-sm font-medium">Permissions</label>
          <div
            class="max-h-48 overflow-y-auto rounded-sm border border-[var(--color-neutral-200)] p-2"
          >
            <div
              v-for="perm in ctrl.permissions.value as any[]"
              :key="perm.code"
              class="flex items-center gap-2 py-1"
            >
              <input
                type="checkbox"
                :checked="ctrl.createPermissions.value.includes(perm.code)"
                @change="ctrl.togglePermission(perm.code)"
                class="rounded border-[var(--color-neutral-300)] text-[var(--color-primary-600)]"
              />
              <span class="text-sm">{{ perm.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="ctrl.isCreateOpen.value = false">Cancel</AppButton>
        <AppButton
          variant="primary"
          :loading="ctrl.commands.value['executeCreate']?.isPending.value"
          @click="ctrl.commands.value['executeCreate']?.execute()"
        >
          Create Role
        </AppButton>
      </template>
    </AppDialog>

    <!-- Detail Dialog -->
    <AppDialog v-model:open="ctrl.isDetailOpen.value" title="Role Details">
      <div v-if="ctrl.selectedRole.value" class="space-y-4 py-4">
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-[var(--color-neutral-500)]">
            Name
          </h3>
          <p class="text-base font-medium">{{ ctrl.selectedRole.value.name }}</p>
        </div>
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-[var(--color-neutral-500)]">
            Description
          </h3>
          <p class="text-sm text-[var(--color-neutral-600)]">
            {{ ctrl.selectedRole.value.description || 'No description provided.' }}
          </p>
        </div>
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-[var(--color-neutral-500)]">
            Permissions
          </h3>
          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="perm in ctrl.selectedRole.value.permissions"
              :key="perm"
              class="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-medium text-[var(--color-neutral-700)] border border-[var(--color-neutral-200)]"
            >
              {{ perm }}
            </span>
          </div>
        </div>
      </div>
    </AppDialog>
  </div>
</template>
