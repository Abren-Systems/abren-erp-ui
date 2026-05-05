<script setup lang="ts">
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { PageHeader } from '@/shared/components/workspace'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { accountColumns } from './grids/account.grid'
import { useAccountListController } from './controller'

const ctrl = useAccountListController()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <PageHeader
      :title="ctrl.screen.titleKey"
      description="Manage your ledger accounts and financial structure."
      icon="LayoutGrid"
    >
      <template #actions>
        <router-link :to="{ name: 'LedgerCoaDetail', params: { id: 'new' } }">
          <AppButton variant="primary">
            <template #start>
              <Plus :size="14" />
            </template>
            New Account
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
        :columns="accountColumns"
        :data="ctrl.accounts.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search accounts..."
        empty-message="Your Chart of Accounts is not set up yet."
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
