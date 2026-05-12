import { toValue, type MaybeRefOrGetter } from 'vue'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { InventoryMapper } from '../infrastructure/mappers'
import { inventoryKeys } from './query-keys'

import type { ListQuery } from '@/shared/domain/pagination'
import type { ItemDTO } from '../infrastructure/api.types'
import { useQuery } from '@tanstack/vue-query'

/**
 * Use Case: View Inventory Items (Paginated)
 *
 * @param {MaybeRefOrGetter<ListQuery>} [query] - Optional pagination parameters.
 */
export function useItems(query?: MaybeRefOrGetter<ListQuery>) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: inventoryKeys.items(query),
    queryFn: async () => {
      const data = await inventoryAdapter.getItems(toValue(query))
      return {
        ...data,
        items: data.items.map((dto: ItemDTO) => InventoryMapper.toItem(dto)),
      }
    },
    staleTime: 1000 * 60 * 5,
  })

  return { inventoryItems: response, isPending, error, refetch }
}
