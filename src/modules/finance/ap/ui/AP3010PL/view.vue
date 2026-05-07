<script setup lang="ts">
import { DataGrid, DataGridFilterSelector, DataGridFooter } from '@/shared/components/data-grid'
import { ListTitleBar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { ListFilter, Plus, RefreshCcw } from 'lucide-vue-next'
import PaymentRequestBulkActionBar from './BulkActionBar.vue'
import PaymentRequestFilterPane from './FilterPane.vue'
import { usePaymentRequestList } from './controller'

const ctrl = usePaymentRequestList()
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--color-neutral-50)]">
    <ListTitleBar :screen-title="ctrl.screen.titleKey" />

    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :data="ctrl.filteredRequests.value"
        :columns="ctrl.columns"
        :loading="ctrl.isLoading.value"
        placeholder="Search requests..."
        row-clickable
        @row-click="ctrl.handleRowClick"
      >
        <template #toolbar>
          <DataGridFilterSelector v-model="ctrl.statusFilter.value" :options="ctrl.filterPresets" />
          <div class="h-4 w-px bg-[var(--color-neutral-200)] mx-1" />
          <AppButton variant="stealth" size="sm" @click="ctrl.commands.value['refresh']?.execute()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>

        <template #toolbar-controls>
          <AppButton variant="outline" size="sm" @click="ctrl.isFilterOpen.value = true">
            <template #start><ListFilter :size="14" /></template>
            Filter
          </AppButton>
          <AppButton
            v-if="ctrl.hasPermission('ap:create')"
            variant="primary"
            size="sm"
            @click="ctrl.commands.value['create']?.execute()"
          >
            <template #start><Plus :size="14" /></template>
            New Request
          </AppButton>
        </template>

        <template #empty-action>
          <AppButton variant="outline" size="sm" @click="ctrl.clearFilters">
            Clear all filters
          </AppButton>
        </template>

        <template #footer>
          <DataGridFooter
            :total-rows="ctrl.filteredRequests.value.length"
            :selected-count="ctrl.selectedCount.value"
            :total-amount-formatted="ctrl.totalFilteredAmount.value.format()"
          />
        </template>
      </DataGrid>
    </div>

    <!-- Floating Bulk Action Bar & Overlay -->
    <PaymentRequestBulkActionBar
      :selected-ids="ctrl.selectedIds.value"
      :filtered-requests="ctrl.filteredRequests.value"
      @clear-selection="ctrl.clearSelection"
    />

    <!-- Sidebars -->
    <PaymentRequestFilterPane
      v-model:open="ctrl.isFilterOpen.value"
      :initial-filters="ctrl.filterState.value"
      :status-options="ctrl.statusOptions"
      @apply="ctrl.filterState.value = $event"
    />
  </div>
</template>

<style scoped>
/* Trace Action Visibility Logic */
:deep(.grid-row) .trace-action-btn {
  opacity: 0;
  transition: all 0.2s ease;
  color: var(--color-neutral-400);
}

:deep(.grid-row:hover) .trace-action-btn {
  opacity: 1;
}

:deep(.grid-row) .trace-action-btn.is-active {
  opacity: 1 !important;
  color: var(--color-primary-600);
  background: var(--color-primary-50);
}
</style>
