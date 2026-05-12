<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { DataGrid } from '@/shared/components/data-grid'

import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { accountColumns } from './grids/bank-account.grid'

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
        v-model:pagination="ctrl.gridState.pagination"
        :columns="accountColumns"
        :data="ctrl.bankAccounts.value?.items ?? []"
        :total-count="ctrl.totalCount.value"
        :loading="ctrl.isLoading.value"
        placeholder="Search bank accounts..."
        empty-message="No bank accounts found."
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
