<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton, AppSelect } from '@/shared/components/primitives'
import { Plus, MapPin, ListFilter, RefreshCcw } from 'lucide-vue-next'
import { stockColumns } from './grids/stock-item.grid'

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <div class="flex-1 p-2.5 min-h-0">
      <div
        v-if="!ctrl.selectedWarehouseId.value"
        class="h-full flex flex-col items-center justify-center text-[var(--color-neutral-500)] bg-white border border-[var(--color-neutral-200)] rounded-sm"
      >
        <ListFilter :size="48" class="mb-4 opacity-10" />
        <p class="text-sm font-medium">Select a warehouse location to view current stock.</p>
        <p class="text-xs mt-1 opacity-60">Use the location filter in the toolbar to proceed.</p>
      </div>

      <DataGrid
        v-else
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :columns="stockColumns"
        :data="ctrl.stockItems.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search stock items..."
        empty-message="No stock items found."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <div
            class="flex items-center gap-2 bg-[var(--color-neutral-50)] px-3 py-1.5 rounded-sm border border-[var(--color-neutral-200)]"
          >
            <MapPin :size="14" class="text-[var(--color-neutral-400)]" />
            <AppSelect
              v-model="ctrl.selectedWarehouseId.value"
              class="min-w-[200px]"
              :options="
                ctrl.warehouses.value?.map((wh) => ({
                  label: `${wh.name} (${wh.code})`,
                  value: wh.id,
                })) ?? []
              "
              placeholder="Select Location"
            />
          </div>
          <AppButton variant="stealth" @click="ctrl.refresh()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>

        <template #toolbar-controls>
          <AppButton variant="primary" size="sm" @click="ctrl.handleCreateAdjustment">
            <template #start>
              <Plus :size="14" />
            </template>
            Post Adjustment
          </AppButton>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
