<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { ListTitleBar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { vendorBillColumns } from './grids/vendor-bill.grid'
import { useVendorBillsListController } from './controller'

const ctrl = useVendorBillsListController()
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
        :columns="vendorBillColumns"
        :data="ctrl.bills.value || []"
        :loading="ctrl.isLoading.value"
        placeholder="Search bills..."
        empty-message="No vendor bills found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton variant="stealth" size="sm" @click="ctrl.commands.value['refresh']?.execute()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>

        <template #toolbar-controls>
          <AppButton variant="primary" size="sm" @click="ctrl.commands.value['create']?.execute()">
            <template #start><Plus :size="14" /></template>
            New Bill
          </AppButton>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
