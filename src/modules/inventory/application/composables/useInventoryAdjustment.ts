import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { inventoryAdapter } from '../../infrastructure/inventory_adapter'
import { inventoryKeys } from '../keys'
import type { AdjustmentCreateDTO } from '../../infrastructure/api.types'

/**
 * Use Case: Create Inventory Adjustment
 *
 * Captures user physical reality corrections and submits them for backend validation,
 * which may trigger universal approval workflows depending on the financial impact.
 */
export function useInventoryAdjustment() {
  const queryClient = useQueryClient()

  const {
    mutateAsync: createAdjustment,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: AdjustmentCreateDTO) => {
      const response = await inventoryAdapter.postAdjustment(payload)
      return response
    },
    onSuccess: (_, variables) => {
      // Invalidate stock positions for this warehouse so UI updates
      void queryClient.invalidateQueries({
        queryKey: inventoryKeys.stock(variables.warehouse_id),
      })
    },
  })

  return { createAdjustment, isPending, error }
}
