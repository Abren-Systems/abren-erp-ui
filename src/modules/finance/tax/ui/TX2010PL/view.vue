<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { PageHeader } from '@/shared/components/workspace'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { taxGroupColumns } from './grids/tax-group.grid'
import { useTaxGroupsListController } from './controller'

const ctrl = useTaxGroupsListController()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <PageHeader
      :title="ctrl.screen.titleKey"
      description="Combine multiple tax rules into compound calculations."
      icon="LayoutGrid"
      plain
    >
      <template #actions>
        <AppButton variant="primary" size="sm" @click="ctrl.handleCreate">
          <template #start>
            <Plus :size="14" />
          </template>
          New Tax Group
        </AppButton>
      </template>
    </PageHeader>

    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
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
