<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Plus, CreditCard } from 'lucide-vue-next'
import { useBankAccounts } from '../../application/composables/useBankAccounts'
import { bankAccountColumns } from '../grids/bank.grid'

/**
 * Bank Accounts List Page.
 *
 * Provides a high-integrity overview of all logical bank accounts.
 * Integrates with the Architecture-defined 4-Layer patterns (Domain, Application, Infrastructure, UI).
 */

// ── Grid state (sorting, selection, filtering) ───────────────────
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

// ── Application Layer Orchestration ────────────────────────────
const { accounts: data, isPending } = useBankAccounts()
</script>

<template>
  <div class="flex h-full flex-col gap-5">
    <!-- Page Header -->
    <div class="flex shrink-0 items-start justify-between">
      <div>
        <h1 class="m-0 text-heading text-[var(--color-grid-text)] tracking-tight">Bank Accounts</h1>
        <p class="mt-1 text-body-sm text-[var(--color-grid-text-muted)]">
          Manage your logical bank accounts and monitor real-time balances across the organization.
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
        :columns="bankAccountColumns"
        :data="data ?? []"
        :loading="isPending"
        row-id="id"
        placeholder="Search by account name or bank..."
      >
        <!-- Toolbar actions -->
        <template #toolbar>
          <Button
            size="sm"
            class="h-[26px] px-2.5 text-xs font-medium shadow-sm transition-all hover:shadow-md"
          >
            <Plus :size="13" class="mr-1" />
            Add Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="h-[26px] px-2.5 text-xs font-medium border-neutral-200/60 transition-all hover:bg-neutral-50/50"
          >
            <CreditCard :size="13" class="mr-1" />
            Connect Bank
          </Button>
        </template>
      </DataGrid>
    </div>
  </div>
</template>

<style scoped>
/* Scoped overrides for premium feeling */
.text-heading {
  font-weight: 700;
  font-size: 1.125rem;
}
</style>
