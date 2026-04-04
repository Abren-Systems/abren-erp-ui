<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { useStockPositions } from '../../application/composables/useStockPositions'
import { useWarehouses } from '../../application/composables/useWarehouses'
import TraceabilityBadge from '../components/TraceabilityBadge.vue'
import { h } from 'vue'
import type { StockItem } from '../../domain/types'

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
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(
        row.original.totalValue,
      )
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
  <div class="p-6 space-y-6">
    <header class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Physical Stock Position</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Monitor your exact inventory valuations and batch locations.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Warehouse Filter -->
        <Select v-model="selectedWarehouseId">
          <SelectTrigger class="w-[250px]">
            <SelectValue placeholder="Select a location..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="wh in warehouses" :key="wh.id" :value="wh.id">
              {{ wh.name }} ({{ wh.code }})
              <span v-if="wh.isQuarantine" class="text-red-500 ml-2">⚠️</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button @click="router.push({ name: 'inventory.adjustment-create' })" variant="secondary">
          Post Adjustment
        </Button>
      </div>
    </header>

    <!-- Graceful state when no warehouse is selected -->
    <div
      v-if="!selectedWarehouseId"
      class="py-12 text-center text-muted-foreground border border-dashed rounded-lg"
    >
      Please select a warehouse location to view its stock positions.
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
</template>
