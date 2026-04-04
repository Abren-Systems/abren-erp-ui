import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { inventoryAdapter } from '../../infrastructure/inventory_adapter'
import { InventoryMapper } from '../../infrastructure/mappers'
import { inventoryKeys } from '../keys'
import type { StockItem } from '../../domain/types'

/**
 * Use Case: View Stock Positions
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
