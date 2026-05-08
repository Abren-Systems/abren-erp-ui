<script setup lang="ts">
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { ref } from 'vue'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus, RefreshCcw } from 'lucide-vue-next'
import { fiscalPeriodColumns } from '../../grids/fiscal-period.grid'
import { usePermissions } from '@/shared/auth/usePermissions'
import FiscalPeriodCreateDrawer from './sidepanels/FiscalPeriodCreateDrawer.vue'
import { useFiscalPeriodsController } from './controller'

/**
 * Stage 1: Queue — Fiscal Periods List Page.
 *
 * Full-screen DataGrid showing all financial periods and their status.
 * Creation handled via slide-out Drawer per the Progressive Disclosure pattern.
 */

const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any
const { hasPermission } = usePermissions()
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :columns="fiscalPeriodColumns"
        :data="ctrl.periods.value ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search periods..."
      >
        <template #toolbar>
          <AppButton variant="stealth" @click="ctrl.commands.value['refresh']?.execute()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
          <AppButton
            v-if="hasPermission('ledger:manage_accounts')"
            variant="primary"
            @click="ctrl.commands.value['create']?.execute()"
          >
            <template #start>
              <Plus :size="14" />
            </template>
            New Period
          </AppButton>
        </template>
      </DataGrid>
    </div>

    <FiscalPeriodCreateDrawer v-model:open="ctrl.isCreateOpen.value" />
  </div>
</template>
