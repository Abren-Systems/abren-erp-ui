import { useQuery } from '@tanstack/vue-query'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { InventoryMapper } from '../infrastructure/mappers'
import { inventoryKeys } from './query-keys'
import type { Warehouse } from '../domain/inventory.types'

/**
 * Use Case: View Warehouses
 * Evaluates raw warehouse DTOs and provides them to the UI layer as domain entities.
 */
export function useWarehouses() {
  const {
    data: warehouses,
    isPending,
    error,
    refetch,
  } = useQuery<Warehouse[], Error>({
    queryKey: inventoryKeys.warehouses(),
    queryFn: async () => {
      const dtos = await inventoryAdapter.getWarehouses()
      return dtos.map((dto) => InventoryMapper.toWarehouse(dto))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return { warehouses, isPending, error, refetch }
}
