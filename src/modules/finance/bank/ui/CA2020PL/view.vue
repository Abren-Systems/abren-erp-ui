<script setup lang="ts">
import { DataGrid } from '@/shared/components/data-grid'
import { PageHeader } from '@/shared/components/workspace'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { accountColumns } from './grids/bank-account.grid'
import { useBankAccountsListController } from './controller'

const ctrl = useBankAccountsListController()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <PageHeader
      :title="ctrl.screen.titleKey"
      description="Manage enterprise bank accounts and balances."
      icon="Landmark"
      plain
    >
      <template #actions>
        <AppButton variant="primary" size="sm" @click="ctrl.handleCreate">
          <template #start>
            <Plus :size="14" />
          </template>
          New Account
        </AppButton>
      </template>
    </PageHeader>

    <div class="flex-1 p-8 min-h-0">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :columns="accountColumns"
        :data="ctrl.accounts.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search bank accounts..."
        empty-message="No bank accounts found."
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
