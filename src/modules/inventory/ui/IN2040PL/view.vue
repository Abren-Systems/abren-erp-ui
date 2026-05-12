<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { warehouseColumns } from './grids/warehouse.grid'

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <div class="flex-1 p-0 min-h-0">
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
