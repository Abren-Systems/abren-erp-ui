<script setup lang="ts">
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { accountColumns } from './grids/account.grid'

const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :columns="accountColumns"
        :data="ctrl.accounts.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search accounts..."
        empty-message="Your Chart of Accounts is not set up yet."
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
