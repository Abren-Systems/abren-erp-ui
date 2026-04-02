import { useQuery } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { APMapper } from '../../infrastructure/mappers'

/**
 * Use Case: View a Single Payment Request.
 *
 * Fetches and maps a specific payment request by ID.
 *
 * @param id - The unique identifier of the payment request.
 * @returns Reactive payment request state.
 * @example
 * const { request, isLoading } = usePaymentRequest('pr_123')
 */
export function usePaymentRequest(id: string) {
  const {
    data: request,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payment-requests', id],
    queryFn: async () => {
      const dto = await apAdapter.getRequest(id)
      return APMapper.toPaymentRequest(dto)
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  return { request, isLoading, error }
}
