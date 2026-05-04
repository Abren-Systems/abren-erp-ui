<script setup lang="ts">
import { DataGrid, DataGridFilterSelector, DataGridFooter } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { WorkspaceLayout, PageHeader } from '@/shared/components/workspace'
import { Plus, ListFilter } from 'lucide-vue-next'
import PaymentRequestBulkActionBar from './bulk-actions.vue'
import PaymentRequestFilterPane from './filters.panel.vue'
import { usePaymentRequestList } from './controller'

const ctrl = usePaymentRequestList()
</script>

<template>
  <WorkspaceLayout>
    <template #header>
      <PageHeader title="Payment Requests" plain>
        <template #actions>
          <AppButton
            v-if="ctrl.hasPermission('ap:create')"
            variant="primary"
            size="sm"
            @click="ctrl.handleCreate"
          >
            <template #start>
              <Plus :size="14" />
            </template>
            New
          </AppButton>
        </template>
      </PageHeader>
    </template>

    <DataGrid
      v-model:sorting="ctrl.sorting.value"
      v-model:row-selection="ctrl.rowSelection.value"
      v-model:column-visibility="ctrl.columnVisibility.value"
      v-model:global-filter="ctrl.globalFilter.value"
      :data="ctrl.filteredRequests.value"
      :columns="ctrl.columns"
      :loading="ctrl.isLoading.value"
      placeholder="Search requests..."
      row-clickable
      class="flex-1"
      @row-click="ctrl.goToDetail"
    >
      <template #toolbar>
        <DataGridFilterSelector v-model="ctrl.statusFilter.value" :options="ctrl.filterPresets" />
      </template>

      <template #toolbar-controls>
        <AppButton variant="outline" size="sm" @click="ctrl.isFilterOpen.value = true">
          <template #start><ListFilter :size="14" /></template>
          Filter
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

    <!-- Floating Bulk Action Bar & Overlay -->
    <PaymentRequestBulkActionBar
      :selected-ids="ctrl.selectedIds.value"
      :filtered-requests="ctrl.filteredRequests.value"
      @clear-selection="ctrl.clearSelection"
    />

    <!-- Sidebars -->
    <template #sidebar>
      <PaymentRequestFilterPane
        v-model:open="ctrl.isFilterOpen.value"
        :initial-filters="ctrl.filterState.value"
        :status-options="ctrl.statusOptions"
        @apply="ctrl.filterState.value = $event"
      />
    </template>
  </WorkspaceLayout>
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
