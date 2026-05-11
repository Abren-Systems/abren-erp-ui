import { useQuery } from '@tanstack/vue-query'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { InventoryMapper } from '../infrastructure/mappers'
import { inventoryKeys } from './query-keys'
import type { Item } from '../models/inventory.types'

/**
 * Use Case: View Inventory Items
 */
export function useItems() {
  const {
    data: items,
    isPending,
    error,
    refetch,
  } = useQuery<Item[], Error>({
    queryKey: inventoryKeys.items(),
    queryFn: async () => {
      const dtos = await inventoryAdapter.getItems()
      return dtos.map((dto) => InventoryMapper.toItem(dto))
    },
    staleTime: 1000 * 60 * 5,
  })

  return { items, isPending, error, refetch }
}
