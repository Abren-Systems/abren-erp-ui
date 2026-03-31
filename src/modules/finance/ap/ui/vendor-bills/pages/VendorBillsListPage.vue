<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { vendorBillColumns } from '../grids/vendor-bill.grid'
import { useVendorBills } from '../../../application/composables/useVendorBills'
import type { VendorBill } from '../../../domain/ap.types'

const router = useRouter()
const { bills, isLoading } = useVendorBills()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

function handleRowClick(bill: VendorBill) {
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
      :data="bills || []"
      :columns="vendorBillColumns"
      :loading="isLoading"
      placeholder="Search vendor bills..."
      @row-click="handleRowClick"
    />
  </div>
</template>
