<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
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
  <div class="flex h-full flex-col gap-5">
    <div class="flex shrink-0 items-start justify-between">
      <div>
        <h1 class="m-0 text-heading text-[var(--color-grid-text)]">Fiscal Periods</h1>
        <p class="mt-1 text-body-sm text-[var(--color-grid-text-muted)]">
          Define and lock financial periods for ledger integrity.
        </p>
      </div>
    </div>

    <div class="min-h-0 flex-1">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :columns="fiscalPeriodColumns"
        :data="periods ?? []"
        :loading="isLoading"
        placeholder="Search periods…"
      >
        <template #toolbar>
          <Button
            v-if="hasPermission('ledger:manage_accounts')"
            size="sm"
            class="h-[26px] px-2.5 text-xs"
            @click="isCreateOpen = true"
          >
            <Plus :size="13" class="mr-1" />
            New Period
          </Button>
        </template>
      </DataGrid>
    </div>

    <FiscalPeriodCreateDrawer v-model:open="isCreateOpen" />
  </div>
</template>
