import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { InventoryMapper } from '../infrastructure/mappers'
import { inventoryKeys } from './query-keys'
import type { StockItem } from '../models/inventory.types'

import type { ListQuery } from '@/shared/domain/pagination'

/**
 * Use Case: View All Stock Positions (Paginated)
 *
 * @param {ListQuery} [query] - Optional pagination parameters.
 */
export function useStockLevels(query?: ListQuery) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: inventoryKeys.stockLevels(query),
    queryFn: async () => {
      const data = await inventoryAdapter.getStockLevels(query)
      return {
        ...data,
        items: data.items.map((dto) => InventoryMapper.toStockItem(dto)),
      }
    },
    staleTime: 1000 * 60,
  })

  return { stockLevels: response, isPending, error, refetch }
}

/**
 * Use Case: View Stock Positions per Warehouse
 *
 * Retrieves stock physical reality per warehouse.
 */
export function useStockPositions(warehouseId: Ref<string | undefined>) {
  const {
    data: stockItems,
    isPending,
    error,
    refetch,
  } = useQuery<StockItem[], Error>({
    queryKey: computed(() => inventoryKeys.stock(warehouseId.value)),
    queryFn: async () => {
      if (!warehouseId.value) return []
      const dtos = await inventoryAdapter.getStockByWarehouse(warehouseId.value)
      return dtos.map((dto) => InventoryMapper.toStockItem(dto))
    },
    enabled: computed(() => !!warehouseId.value),
    staleTime: 1000 * 60, // 1 minute
  })

  return { stockItems, isPending, error, refetch }
}

/**
 * Use Case: View Stock Item Detail
 */
export function useStockItem(stockItemId: Ref<string | null>) {
  const {
    data: stockItem,
    isPending,
    error,
    refetch,
  } = useQuery<StockItem, Error>({
    queryKey: computed(() => ['inventory', 'stock', 'detail', stockItemId.value]),
    queryFn: async () => {
      if (!stockItemId.value) throw new Error('Stock Item ID is required')
      const dto = await inventoryAdapter.getStockItemById(stockItemId.value)
      return InventoryMapper.toStockItem(dto)
    },
    enabled: computed(() => !!stockItemId.value),
    staleTime: 1000 * 60,
  })

  const isLoading = computed(() => isPending.value)
  const queryError = computed(() => error.value)

  return {
    stockItem,
    isLoading,
    error: queryError,
    refetch,
  }
}
