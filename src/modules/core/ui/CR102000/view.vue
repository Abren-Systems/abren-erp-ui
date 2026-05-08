<script setup lang="ts">
import { DataGrid } from '@/shared/components/data-grid'
import { ListTitleBar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { useTenantSettingsController, type TenantSetting } from './controller'

const ctrl = useTenantSettingsController()

const settingColumns = [
  {
    accessorKey: 'key',
    header: 'Configuration Key',
  },
  {
    accessorKey: 'value',
    header: 'Current Value',
    cell: ({ row }: { row: { original: TenantSetting } }) => row.original.value || 'Default',
  },
]
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--color-neutral-50)]">
    <ListTitleBar :screen-title="ctrl.screen.titleKey" />

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :data="(ctrl.settings.value as TenantSetting[]) || []"
        :columns="settingColumns"
        :loading="ctrl.isLoading.value"
        placeholder="Search settings..."
        empty-message="No settings configured."
      >
        <template #toolbar>
          <AppButton
            variant="primary"
            size="sm"
            @click="
              (
                ctrl.model.value.ui.actions.primary.find((a) => a.command.id === 'bulkEdit') ||
                ctrl.model.value.ui.actions.secondary.find((a) => a.command.id === 'bulkEdit')
              )?.command?.execute()
            "
          >
            Edit Settings
          </AppButton>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
