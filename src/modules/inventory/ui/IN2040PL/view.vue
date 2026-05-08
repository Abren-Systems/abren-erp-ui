<script setup lang="ts">
import { DataGrid } from '@/shared/components/data-grid'
import { ListTitleBar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { warehouseColumns } from './grids/warehouse.grid'
import { useWarehousesListController } from './controller'

const ctrl = useWarehousesListController()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <ListTitleBar :screen-title="ctrl.screen.titleKey" />

    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :columns="warehouseColumns"
        :data="ctrl.warehouses.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search warehouses..."
        empty-message="No warehouses found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <div class="flex items-center gap-2">
            <AppButton variant="primary" size="sm" @click="ctrl.handleCreate">
              Add Warehouse
            </AppButton>
            <AppButton variant="stealth" @click="ctrl.refresh()">
              <template #start>
                <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
              </template>
              Refresh
            </AppButton>
          </div>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
