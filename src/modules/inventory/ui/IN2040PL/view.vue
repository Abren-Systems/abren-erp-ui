<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { PageHeader } from '@/shared/components/workspace'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { warehouseColumns } from './grids/warehouse.grid'
import { useWarehousesListController } from './controller'

const ctrl = useWarehousesListController()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <PageHeader
      :title="ctrl.screen.titleKey"
      description="Manage physical locations and regulatory quarantine zones."
      icon="Warehouse"
      plain
    >
      <template #actions>
        <AppButton variant="primary" size="sm" @click="ctrl.handleCreate">
          <template #start>
            <Plus :size="14" />
          </template>
          Add Location
        </AppButton>
      </template>
    </PageHeader>

    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="warehouseColumns"
        :data="ctrl.warehouses.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search warehouses..."
        empty-message="No warehouses found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton variant="stealth" @click="ctrl.refresh()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
