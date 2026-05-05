<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { PageHeader } from '@/shared/components/workspace'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { journalEntryColumns } from './grids/journal-entry.grid'
import { useJournalEntriesListController } from './controller'

const ctrl = useJournalEntriesListController()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <PageHeader
      :title="ctrl.screen.titleKey"
      description="View and manage double-entry accounting records."
      icon="BookOpen"
    >
      <template #actions>
        <router-link :to="{ name: 'LedgerJournalDetail', params: { id: 'new' } }">
          <AppButton variant="primary">
            <template #start>
              <Plus :size="14" />
            </template>
            New Entry
          </AppButton>
        </router-link>
      </template>
    </PageHeader>

    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="journalEntryColumns"
        :data="ctrl.entries.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search entries..."
        empty-message="No journal entries found."
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
