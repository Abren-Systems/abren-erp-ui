import { computed, type Ref } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { InventoryMapper } from '../infrastructure/mappers'
import { inventoryKeys } from './query-keys'
import type { Warehouse } from '../models/inventory.types'
import type { WarehouseDTO } from '../infrastructure/api.types'

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

/**
 * Use Case: View Warehouse Detail
 */
export function useWarehouse(warehouseId: Ref<string | null>) {
  const {
    data: warehouse,
    isPending,
    error,
    refetch,
  } = useQuery<Warehouse, Error>({
    queryKey: computed(() => ['inventory', 'warehouses', 'detail', warehouseId.value]),
    queryFn: async () => {
      if (!warehouseId.value) throw new Error('Warehouse ID is required')
      const dto = await inventoryAdapter.getWarehouseById(warehouseId.value)
      return InventoryMapper.toWarehouse(dto)
    },
    enabled: computed(() => !!warehouseId.value),
    staleTime: 1000 * 60,
  })

  return { warehouse, isLoading: isPending, error, refetch }
}

/**
 * Use Case: Create Warehouse
 */
export function useCreateWarehouse() {
  const { mutateAsync: createWarehouse, isPending: isCreating } = useMutation({
    mutationFn: (dto: Partial<WarehouseDTO>) => inventoryAdapter.createWarehouse(dto),
  })

  return { createWarehouse, isCreating }
}
