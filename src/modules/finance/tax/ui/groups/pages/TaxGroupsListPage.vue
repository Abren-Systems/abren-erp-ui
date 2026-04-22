<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus, LayoutGrid } from 'lucide-vue-next'
import { useActiveTaxGroups } from '../../../application/useTaxRules'
import TaxGroupCreateDrawer from '../components/TaxGroupCreateDrawer.vue'
import { taxGroupColumns } from '../grids/tax-group.grid'

/**
 * Page: Tax Groups List.
 *
 * Displays all active tax groups and provides entry for creating new ones.
 * Tax Groups allow combining multiple tax rules (e.g. VAT + Excise).
 */
const { data: groups, isPending } = useActiveTaxGroups()
const { gridState } = useDataGrid()

const isCreateDrawerOpen = ref(false)

function openCreateDrawer() {
  isCreateDrawerOpen.value = true
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
            Tax Groups
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Combine multiple tax rules into compound calculations.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" @click="openCreateDrawer">
          <Plus class="mr-2 h-4 w-4" />
          New Tax Group
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        :data="groups || []"
        :columns="taxGroupColumns"
        :loading="isPending"
        :state="gridState"
      />
    </div>

    <TaxGroupCreateDrawer v-model:open="isCreateDrawerOpen" />
  </div>
</template>
