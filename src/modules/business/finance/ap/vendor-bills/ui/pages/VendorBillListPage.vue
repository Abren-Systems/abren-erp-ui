<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/core/ui/data-grid'
import { Button } from '@/core/ui/button'
import { vendorBillColumns } from '../grids/vendor-bill.grid'
import { useVendorBillsStore } from '../../application/store/useVendorBillsStore'
import type { VendorBillDTO } from '../../infrastructure/api.types'

const router = useRouter()
const store = useVendorBillsStore()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

onMounted(() => {
  store.fetchBills()
})

function handleRowClick(bill: VendorBillDTO) {
  void router.push({ name: 'VendorBillDetail', params: { id: bill.id } })
}

function handleCreate() {
  void router.push({ name: 'VendorBillCreate' })
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Vendor Bills</h1>
        <p class="text-sm text-neutral-500">Manage inbound supplier invoices and AP accruals.</p>
      </div>
      <Button variant="default" @click="handleCreate">New Bill</Button>
    </header>

    <DataGrid
      v-model:sorting="sorting"
      v-model:row-selection="rowSelection"
      v-model:column-visibility="columnVisibility"
      v-model:global-filter="globalFilter"
      :data="store.bills || []"
      :columns="vendorBillColumns"
      :loading="store.isLoading"
      placeholder="Search vendor bills..."
      @row-click="handleRowClick"
    />
  </div>
</template>
