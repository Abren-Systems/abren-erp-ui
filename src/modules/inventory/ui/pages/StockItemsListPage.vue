<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton, AppSelect } from '@/shared/components/primitives'
import { Package, MapPin, Plus, ListFilter } from 'lucide-vue-next'
import { useStockPositions } from '../../application/useStockPositions'
import { useWarehouses } from '../../application/useWarehouses'
import TraceabilityBadge from '../components/TraceabilityBadge.vue'
import { h } from 'vue'
import type { StockItem } from '../../domain/inventory.types'

const router = useRouter()

// UI State
const selectedWarehouseId = ref<string | undefined>(undefined)
const gridState = useDataGrid()

// Application State
const { warehouses } = useWarehouses()
const { stockItems, isPending } = useStockPositions(selectedWarehouseId)

const stockColumns = [
  {
    accessorKey: 'itemSku', // Requires denormalization in actual mapper, assumed string for UI demo
    header: 'SKU',
    cell: ({ row }: { row: { original: StockItem } }) => {
      // Temporary fallback for ID display
      return row.original.itemId.slice(0, 8) + '...'
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity (Physical)',
  },
  {
    accessorKey: 'totalValue',
    header: 'Total Value (ETB)',
    cell: ({ row }: { row: { original: StockItem } }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ETB',
      }).format(row.original.totalValue)
    },
  },
  {
    accessorKey: 'traceability',
    header: 'Traceability',
    cell: ({ row }: { row: { original: StockItem } }) => {
      const mode = row.original.serialId ? 'SERIAL' : row.original.batchId ? 'BATCH' : 'NONE'
      return h(TraceabilityBadge, { trackingMode: mode })
    },
  },
]

function handleRowClick(stock: StockItem) {
  router.push({ name: 'inventory.stock-detail', params: { id: stock.id } })
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
          <Package class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Physical Stock Position
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Monitor your exact inventory valuations and batch locations.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Warehouse Filter -->
        <div
          class="flex items-center gap-2 bg-[var(--color-neutral-50)] px-3 py-1.5 rounded-sm border border-[var(--color-neutral-200)]"
        >
          <MapPin :size="14" class="text-[var(--color-neutral-400)]" />
          <AppSelect
            v-model="selectedWarehouseId"
            class="min-w-[200px]"
            :options="
              warehouses?.map((wh) => ({ label: `${wh.name} (${wh.code})`, value: wh.id })) ?? []
            "
            placeholder="Select Location"
          />
        </div>

        <AppButton variant="primary" @click="router.push({ name: 'inventory.adjustment-create' })">
          <Plus :size="14" class="mr-2" />
          Post Adjustment
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <!-- Graceful state when no warehouse is selected -->
      <div
        v-if="!selectedWarehouseId"
        class="h-full flex flex-col items-center justify-center text-[var(--color-neutral-500)] bg-white border border-[var(--color-neutral-200)] rounded-sm"
      >
        <ListFilter :size="48" class="mb-4 opacity-10" />
        <p class="text-sm font-medium">Select a warehouse location to view current stock.</p>
        <p class="text-xs mt-1 opacity-60">Use the location filter in the header to proceed.</p>
      </div>

      <!-- Data Grid -->
      <DataGrid
        v-else
        :data="stockItems || []"
        :columns="stockColumns"
        :loading="isPending"
        :state="gridState"
        @row-click="handleRowClick"
      />
    </div>
  </div>
</template>
