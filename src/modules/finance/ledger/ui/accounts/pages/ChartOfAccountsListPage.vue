<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Plus } from 'lucide-vue-next'
import CreateAccountDrawer from '../components/CreateAccountDrawer.vue'
import { useLedgerAccounts } from '../../../application/composables/useLedgerAccounts'
import { accountColumns } from '../grids/account.grid'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { Account } from '../../../domain/account.types'

// ── Grid state (sorting, selection, global filter) ─────────────
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

// ── Application Layer Orchestration ────────────────────────────
const { accounts: data, isPending } = useLedgerAccounts()
const { hasPermission } = usePermissions()
const router = useRouter()

const isDrawerOpen = ref(false)

function handleRowClick(row: Account) {
  void router.push({ name: 'LedgerCoaDetail', params: { accountId: row.id } })
}
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
        row-clickable
        @row-click="handleRowClick"
      >
        <!-- Toolbar actions -->
        <template #toolbar>
          <Button
            v-if="hasPermission('ledger:manage_accounts')"
            size="sm"
            class="h-[26px] px-2.5 text-xs"
            @click="isDrawerOpen = true"
          >
            <Plus :size="13" class="mr-1" />
            New Account
          </Button>
        </template>
      </DataGrid>
    </div>

    <!-- Creation Context -->
    <CreateAccountDrawer v-model:open="isDrawerOpen" />
  </div>
</template>
