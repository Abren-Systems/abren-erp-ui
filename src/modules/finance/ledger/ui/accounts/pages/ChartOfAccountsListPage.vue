<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus, LayoutGrid } from 'lucide-vue-next'
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
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <LayoutGrid class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Chart of Accounts
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Manage your ledger accounts and financial structure.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          v-if="hasPermission('ledger:manage_accounts')"
          variant="primary"
          @click="isDrawerOpen = true"
        >
          <Plus :size="14" class="mr-2" />
          New Account
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
        :columns="accountColumns"
        :data="data ?? []"
        :loading="isPending"
        placeholder="Search accounts…"
        empty-message="Your Chart of Accounts is not set up yet. Establish your financial foundation to begin recording transactions."
        row-clickable
        @row-click="handleRowClick"
      >
        <!-- Toolbar actions -->
        <template #toolbar>
          <!-- Grid-specific actions can go here (Export, Import) -->
        </template>

        <!-- Empty State Operational Action -->
        <template #empty-action>
          <AppButton
            v-if="hasPermission('ledger:manage_accounts')"
            variant="primary"
            class="mt-4"
            @click="isDrawerOpen = true"
          >
            <Plus :size="16" class="mr-2" />
            Setup Chart of Accounts
          </AppButton>
        </template>
      </DataGrid>
    </div>

    <!-- Creation Context -->
    <CreateAccountDrawer v-model:open="isDrawerOpen" />
  </div>
</template>
