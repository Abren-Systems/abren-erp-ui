<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton, AppBadge } from '@/shared/components/primitives'
import { Warehouse as WarehouseIcon, MapPin, Plus } from 'lucide-vue-next'
import { useWarehouses } from '../../application/useWarehouses'
import TraceabilityBadge from '../components/TraceabilityBadge.vue'
import { h } from 'vue'
import type { Warehouse } from '../../domain/inventory.types'

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
      return h(
        AppBadge,
        {
          variant: row.original.isActive ? 'success' : 'neutral',
        },
        () => (row.original.isActive ? 'Active' : 'Inactive'),
      )
    },
  },
]

function handleRowClick(warehouse: Warehouse) {
  router.push({
    name: 'inventory.warehouse-detail',
    params: { id: warehouse.id },
  })
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
          <WarehouseIcon class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Warehouses
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Manage physical locations and regulatory quarantine zones.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" @click="router.push({ name: 'inventory.warehouse-create' })">
          <template #start>
            <Plus :size="14" />
          </template>
          Add Location
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        :data="warehouses || []"
        :columns="warehouseColumns"
        :loading="isPending"
        :state="gridState"
        @row-click="handleRowClick"
      />
    </div>
  </div>
</template>
