<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/core/ui/data-grid'
import { Button } from '@/core/ui/button'
import { Plus } from 'lucide-vue-next'
import { useLedgerAccounts } from '../../application/composables/useLedgerAccounts'
import { accountColumns } from '../grids/account.grid'

// ── Grid state (sorting, selection, global filter) ─────────────
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

// ── Application Layer Orchestration ────────────────────────────
const { accounts: data, isPending } = useLedgerAccounts()
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; height: 100%">
    <!-- Page Header -->
    <div
      style="display: flex; align-items: flex-start; justify-content: space-between; flex-shrink: 0"
    >
      <div>
        <h1 style="font-size: 22px; font-weight: 700; color: var(--color-grid-text); margin: 0">
          Chart of Accounts
        </h1>
        <p style="font-size: 13px; color: var(--color-grid-text-muted); margin: 4px 0 0">
          Manage your ledger accounts and financial structure.
        </p>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div style="flex: 1; min-height: 0">
      <DataGrid
        :columns="accountColumns"
        :data="data ?? []"
        :loading="isPending"
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        placeholder="Search accounts…"
      >
        <!-- Toolbar actions -->
        <template #toolbar>
          <Button size="sm" style="height: 26px; font-size: 12px; padding: 0 10px">
            <Plus :size="13" style="margin-right: 4px" />
            New Account
          </Button>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
