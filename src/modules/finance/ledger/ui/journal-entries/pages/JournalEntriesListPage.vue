<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw, BookOpen } from 'lucide-vue-next'
import { useJournalEntries } from '../../../application/composables/useJournalEntries'
import { useLedgerAccounts } from '../../../application/composables/useLedgerAccounts'
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
const { accounts, isPending: isAccountsLoading } = useLedgerAccounts()

const hasAccounts = computed(() => accounts.value && accounts.value.length > 0)

const isCreateOpen = ref(false)

function handleRowClick(row: JournalEntry) {
  void router.push({ name: 'LedgerJournalDetail', params: { entryId: row.id } })
}
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <BookOpen class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Journal Entries
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            View and manage double-entry accounting records.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          v-if="hasPermission('ledger:create_entry')"
          variant="primary"
          :disabled="!hasAccounts"
          @click="isCreateOpen = true"
        >
          <Plus :size="14" class="mr-2" />
          New Entry
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="journalEntryColumns"
        :data="entries ?? []"
        :loading="isLoading"
        placeholder="Search entries…"
        :empty-message="
          hasAccounts
            ? 'No journal entries found. Book your first transaction.'
            : 'You must establish your Chart of Accounts before booking journal entries.'
        "
        row-clickable
        @row-click="handleRowClick"
      >
        <template #toolbar>
          <AppButton variant="stealth" @click="refresh()">
            <RefreshCcw :class="['mr-1 h-3.5 w-3.5', isLoading && 'animate-spin']" />
            Refresh
          </AppButton>
        </template>

        <!-- Empty State Operational Action -->
        <template #empty-action>
          <template v-if="!isAccountsLoading">
            <template v-if="hasAccounts">
              <AppButton
                v-if="hasPermission('ledger:create_entry')"
                variant="primary"
                @click="isCreateOpen = true"
              >
                <Plus :size="16" class="mr-2" />
                Book Journal Entry
              </AppButton>
            </template>
            <template v-else>
              <router-link :to="{ name: 'LedgerCoa' }">
                <AppButton variant="primary"> Setup Chart of Accounts </AppButton>
              </router-link>
            </template>
          </template>
        </template>
      </DataGrid>
    </div>

    <!-- Creation Context -->
    <JournalEntryCreateDrawer v-model:open="isCreateOpen" />
  </div>
</template>
