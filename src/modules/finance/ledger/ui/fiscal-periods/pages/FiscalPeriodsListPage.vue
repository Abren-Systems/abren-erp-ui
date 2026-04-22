<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus } from 'lucide-vue-next'
import { useFiscalPeriods } from '../../../application/composables/useFiscalPeriods'
import { fiscalPeriodColumns } from '../../grids/fiscal-period.grid'
import { usePermissions } from '@/shared/auth/usePermissions'
import FiscalPeriodCreateDrawer from '../components/FiscalPeriodCreateDrawer.vue'

/**
 * Stage 1: Queue — Fiscal Periods List Page.
 *
 * Full-screen DataGrid showing all financial periods and their status.
 * Creation handled via slide-out Drawer per the Progressive Disclosure pattern.
 */

const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
const { periods, isLoading } = useFiscalPeriods()
const { hasPermission } = usePermissions()

const isCreateOpen = ref(false)
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <Calendar class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Fiscal Periods
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Define and lock financial periods for ledger integrity.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          v-if="hasPermission('ledger:manage_accounts')"
          variant="primary"
          @click="isCreateOpen = true"
        >
          <Plus :size="14" class="mr-2" />
          New Period
        </AppButton>
      </div>
    </div>

    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="fiscalPeriodColumns"
        :data="periods ?? []"
        :loading="isLoading"
        placeholder="Search periods..."
      />
    </div>

    <FiscalPeriodCreateDrawer v-model:open="isCreateOpen" />
  </div>
</template>
