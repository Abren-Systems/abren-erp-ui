<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Plus } from 'lucide-vue-next'
import { useLedgerAccounts } from '../../../application/composables/useLedgerAccounts'
import { accountColumns } from '../grids/account.grid'

// ── Grid state (sorting, selection, global filter) ─────────────
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

// ── Application Layer Orchestration ────────────────────────────
const { accounts: data, isPending } = useLedgerAccounts()
</script>

<template>
  <div class="flex h-full flex-col gap-5">
    <!-- Page Header -->
    <div class="flex shrink-0 items-start justify-between">
      <div>
        <h1 class="m-0 text-heading text-[var(--color-grid-text)]">Chart of Accounts</h1>
        <p class="mt-1 text-body-sm text-[var(--color-grid-text-muted)]">
          Manage your ledger accounts and financial structure.
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
        :columns="accountColumns"
        :data="data ?? []"
        :loading="isPending"
        placeholder="Search accounts…"
      >
        <!-- Toolbar actions -->
        <template #toolbar>
          <Button size="sm" class="h-[26px] px-2.5 text-xs">
            <Plus :size="13" class="mr-1" />
            New Account
          </Button>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
