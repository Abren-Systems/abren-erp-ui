<script setup lang="ts">
import { inject, computed } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Edit3 } from 'lucide-vue-next'
import {
  useTenantSettingsController,
  type TenantSetting,
  type TenantSettingsController,
} from './controller'
import { ScreenControllerKey } from '@/platform/screen-runtime/injection-keys'

const controllerRef = inject(ScreenControllerKey)!
const controller = computed(() => controllerRef.value as TenantSettingsController)
const gridState = useDataGrid()

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
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="gridState.sorting"
        v-model:row-selection="gridState.rowSelection"
        v-model:column-visibility="gridState.columnVisibility"
        v-model:global-filter="gridState.globalFilter"
        :data="controller.data.selectGrid('settings').value as TenantSetting[]"
        :columns="settingColumns"
        :loading="controller.isLoading.value"
        placeholder="Search settings..."
        empty-message="No settings configured."
      />
    </div>
  </div>
</template>
