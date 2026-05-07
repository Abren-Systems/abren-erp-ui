import { type Ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { inventoryKeys } from './query-keys'
import type { AdjustmentCreateDTO } from '../infrastructure/api.types'

export type { AdjustmentCreateDTO }

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

/**
 * Use Case: View Adjustment Detail
 */
export function useAdjustment(adjustmentId: Ref<string | null>) {
  const {
    data: adjustment,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: computed(() => ['inventory', 'adjustments', 'detail', adjustmentId.value]),
    queryFn: async () => {
      if (!adjustmentId.value) throw new Error('Adjustment ID is required')
      return inventoryAdapter.getAdjustmentById(adjustmentId.value)
    },
    enabled: computed(() => !!adjustmentId.value),
    staleTime: 1000 * 60,
  })

  return { adjustment, isLoading: isPending, error, refetch }
}

/**
 * Use Case: View Adjustments List
 */
export function useAdjustments() {
  const {
    data: adjustments,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['inventory', 'adjustments', 'list'],
    queryFn: () => inventoryAdapter.getAdjustments(),
    staleTime: 1000 * 60 * 5,
  })

  return { adjustments, isLoading: isPending, error, refetch }
}
