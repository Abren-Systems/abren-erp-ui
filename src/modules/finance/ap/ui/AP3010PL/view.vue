<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { vendorBillColumns } from './grids/vendor-bill.grid'

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <div class="min-h-0 flex-1 p-0">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting.value"
        v-model:row-selection="ctrl.gridState.rowSelection.value"
        v-model:column-visibility="ctrl.gridState.columnVisibility.value"
        v-model:global-filter="ctrl.gridState.globalFilter.value"
        v-model:pagination="ctrl.gridState.pagination.value"
        :columns="vendorBillColumns"
        :data="ctrl.vendorBills.value?.items ?? []"
        :total-count="ctrl.totalCount.value"
        :loading="ctrl.isLoading.value"
        placeholder="Search bills..."
        empty-message="No vendor bills found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <AppButton
            variant="stealth"
            size="sm"
            @click="
              ctrl.model.value.ui.actions.secondary
                .find((a) => a.command.id === 'refresh')
                ?.command.execute()
            "
          >
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>

        <template #toolbar-controls>
          <AppButton
            variant="primary"
            size="sm"
            @click="
              ctrl.model.value.ui.actions.primary
                .find((a) => a.command.id === 'create')
                ?.command.execute()
            "
          >
            <template #start><Plus :size="14" /></template>
            New Bill
          </AppButton>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
