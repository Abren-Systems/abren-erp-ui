import { useQuery } from '@tanstack/vue-query'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { InventoryMapper } from '../infrastructure/mappers'
import { inventoryKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'
import type { ItemDTO } from '../infrastructure/api.types'

/**
 * Use Case: View Inventory Items (Paginated)
 *
 * @param {ListQuery} [query] - Optional pagination parameters.
 */
export function useItems(query?: ListQuery) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: inventoryKeys.items(query),
    queryFn: async () => {
      const data = await inventoryAdapter.getItems(query)
      return {
        ...data,
        items: data.items.map((dto: ItemDTO) => InventoryMapper.toItem(dto)),
      }
    },
    staleTime: 1000 * 60 * 5,
  })

  return { items: response, isPending, error, refetch }
}
