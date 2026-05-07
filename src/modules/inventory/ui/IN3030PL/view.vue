<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { ListTitleBar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { adjustmentColumns } from './grids/adjustment.grid'
import { useAdjustmentsListController } from './controller'

const ctrl = useAdjustmentsListController()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <ListTitleBar :screen-title="ctrl.screen.titleKey" />

    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="adjustmentColumns"
        :data="ctrl.adjustments.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search adjustments..."
        empty-message="No adjustments found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <div class="flex items-center gap-2">
            <AppButton variant="primary" size="sm" @click="ctrl.handleCreate">
              New Adjustment
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
