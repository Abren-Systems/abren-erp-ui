<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { PageHeader } from '@/shared/components/workspace'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { vendorBillColumns } from './grids/vendor-bill.grid'
import { useVendorBillsListController } from './controller'

const ctrl = useVendorBillsListController()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <PageHeader
      :title="ctrl.screen.titleKey"
      description="Manage supplier invoices and bills."
      icon="Receipt"
      plain
    >
      <template #actions>
        <AppButton variant="primary" size="sm" @click="ctrl.handleCreate">
          <template #start>
            <Plus :size="14" />
          </template>
          New
        </AppButton>
      </template>
    </PageHeader>

    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="vendorBillColumns"
        :data="ctrl.bills.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search bills..."
        empty-message="No vendor bills found."
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
