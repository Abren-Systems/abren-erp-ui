<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { useWarehouses } from '../../application/composables/useWarehouses'
import TraceabilityBadge from '../components/TraceabilityBadge.vue'
import { h } from 'vue'
import type { Warehouse } from '../../domain/types'

const router = useRouter()

// Application Layer State
const { warehouses, isPending } = useWarehouses()

// UI Layer State
const gridState = useDataGrid()

const warehouseColumns = [
  {
    accessorKey: 'code',
    header: 'Warehouse Code',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'isQuarantine',
    header: 'Regulatory Status',
    cell: ({ row }: { row: { original: Warehouse } }) => {
      return h(TraceabilityBadge, { isQuarantine: row.original.isQuarantine })
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }: { row: { original: Warehouse } }) => {
      return row.original.isActive ? 'Active' : 'Inactive'
    },
  },
]

function handleRowClick(warehouse: Warehouse) {
  router.push({ name: 'inventory.warehouse-detail', params: { id: warehouse.id } })
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Warehouses</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Manage physical locations and regulatory quarantine zones.
        </p>
      </div>
      <Button @click="router.push({ name: 'inventory.warehouse-create' })"> Add Location </Button>
    </header>

    <DataGrid
      :data="warehouses || []"
      :columns="warehouseColumns"
      :loading="isPending"
      :state="gridState"
      @row-click="handleRowClick"
    />
  </div>
</template>
