<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Plus } from 'lucide-vue-next'
import { useActiveTaxRules } from '../../../application/useTaxRules'
import TaxRuleCreateDrawer from '../components/TaxRuleCreateDrawer.vue'
import { taxRuleColumns } from '../grids/tax-rule.grid'

/**
 * Page: Tax Rules List.
 *
 * Displays all active tax rules and provides entry for creating new ones.
 */
const { data: rules, isPending } = useActiveTaxRules()
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
        <h1 class="text-2xl font-bold tracking-tight">Tax Rules</h1>
        <p class="text-muted-foreground">Manage your tax rates and configurations.</p>
      </div>
      <Button @click="openCreateDrawer">
        <Plus class="mr-2 h-4 w-4" />
        New Tax Rule
      </Button>
    </header>

    <DataGrid
      :data="rules || []"
      :columns="taxRuleColumns"
      :loading="isPending"
      :state="gridState"
    />

    <TaxRuleCreateDrawer v-model:open="isCreateDrawerOpen" />
  </div>
</template>
