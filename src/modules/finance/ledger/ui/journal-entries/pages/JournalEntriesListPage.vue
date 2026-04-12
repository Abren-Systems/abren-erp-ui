<script setup lang="ts">
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { useJournalEntries } from '../../../application/composables/useJournalEntries'
import { journalEntryColumns } from '../../grids/journal-entry.grid'
import { usePermissions } from '@/shared/auth/usePermissions'
import JournalEntryCreateDrawer from '../components/JournalEntryCreateDrawer.vue'
import type { JournalEntry } from '../../../domain/journal-entry.types'

/**
 * Stage 1: Queue — Journal Entries List Page.
 *
 * Progressive Disclosure flow:
 *   THIS PAGE → router.push(LedgerJournalDetail) → JournalEntryDetailPage
 *
 * Density: Maximum. Compact rows, filters, no inline mutations.
 * Row clicks navigate cleanly to the Focus Canvas (Detail page).
 */

const router = useRouter()
const { hasPermission } = usePermissions()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
const { entries, isLoading, refresh } = useJournalEntries()

const isCreateOpen = ref(false)

function handleRowClick(row: JournalEntry) {
  void router.push({ name: 'LedgerJournalDetail', params: { entryId: row.id } })
}
</script>

<template>
  <div class="flex h-full flex-col gap-5">
    <!-- Page Header -->
    <div class="flex shrink-0 items-start justify-between">
      <div>
        <h1 class="m-0 text-heading text-[var(--color-grid-text)]">Journal Entries</h1>
        <p class="mt-1 text-body-sm text-[var(--color-grid-text-muted)]">
          View and manage double-entry accounting records.
        </p>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="journalEntryColumns"
        :data="entries ?? []"
        :loading="isLoading"
        placeholder="Search entries…"
        row-clickable
        @row-click="handleRowClick"
      >
        <template #toolbar>
          <Button variant="outline" size="sm" class="h-[26px] px-2.5 text-xs" @click="refresh()">
            <RefreshCcw :class="['mr-1 h-3 w-3', isLoading && 'animate-spin']" />
            Refresh
          </Button>
          <Button
            v-if="hasPermission('ledger:create_entry')"
            size="sm"
            class="h-[26px] px-2.5 text-xs"
            @click="isCreateOpen = true"
          >
            <Plus :size="13" class="mr-1" />
            New Entry
          </Button>
        </template>
      </DataGrid>
    </div>

    <!-- Creation Context -->
    <JournalEntryCreateDrawer v-model:open="isCreateOpen" />
  </div>
</template>
