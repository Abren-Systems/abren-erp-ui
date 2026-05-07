<script setup lang="ts">
import { DataGrid } from '@/shared/components/data-grid'
import { FormTitleBar, FormToolbar } from '@/platform/chrome'
import { AppButton } from '@/shared/components/primitives'
import { RefreshCcw } from 'lucide-vue-next'
import { taxGroupColumns } from './grids/tax-group.grid'
import { useTaxGroupsListController } from './controller'

const ctrl = useTaxGroupsListController()

</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <!-- Header -->
    <FormTitleBar :form-title="ctrl.screen.titleKey" />

    <!-- Toolbar -->
    <FormToolbar
      :model="ctrl.model.value"
      :executors="ctrl.commands.value"
      :is-pending="ctrl.isPending.value"
      :is-new="false"
    />

    <!-- Main Content -->
    <div class="flex-1 p-8 min-h-0 overflow-y-auto">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :columns="taxGroupColumns"
        :data="ctrl.groups.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search tax groups..."
        empty-message="No tax groups found."
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
