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
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2">
          <LayoutGrid class="h-6 w-6 text-primary" />
          <h1 class="text-2xl font-bold tracking-tight">Tax Groups</h1>
        </div>
        <p class="text-muted-foreground">Combine multiple tax rules into compound calculations.</p>
      </div>
      <AppButton @click="openCreateDrawer">
        <Plus class="mr-2 h-4 w-4" />
        New Tax Group
      </AppButton>
    </header>

    <DataGrid
      :data="groups || []"
      :columns="taxGroupColumns"
      :loading="isPending"
      :state="gridState"
    />

    <TaxGroupCreateDrawer v-model:open="isCreateDrawerOpen" />
  </div>
</template>
