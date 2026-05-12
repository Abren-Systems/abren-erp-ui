import { type Ref, computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { inventoryAdapter } from '../infrastructure/inventory.adapter'
import { inventoryKeys } from './query-keys'
import type { CreateAdjustmentDTO } from '../infrastructure/api.types'
import type { ListQuery } from '@/shared/domain/pagination'

export type { CreateAdjustmentDTO }

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
    mutationFn: async (payload: CreateAdjustmentDTO) => {
      return await inventoryAdapter.postAdjustment(payload)
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

  return {
    inventoryAdjustment: adjustment,
    operations: computed(() => adjustment.value?.__operations),
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Use Case: View Adjustments List (Paginated)
 *
 * @param {MaybeRefOrGetter<ListQuery>} [query] - Optional pagination parameters.
 */
export function useAdjustments(query?: MaybeRefOrGetter<ListQuery>) {
  const {
    data: response,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: inventoryKeys.adjustments(query),
    queryFn: () => inventoryAdapter.getAdjustments(toValue(query)),
    staleTime: 1000 * 60 * 5,
  })

  return {
    inventoryAdjustments: response, // Adapter already returns ListResponse<AdjustmentDTO>
    isLoading: isPending,
    error,
    refetch,
  }
}
