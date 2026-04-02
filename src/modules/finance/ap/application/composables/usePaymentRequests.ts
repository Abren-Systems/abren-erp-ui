import { useQuery } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'
import { APMapper } from '../../infrastructure/mappers'

/**
 * Use Case: View Payment Requests List.
 *
 * Fetches and maps all standalone payment requests.
 *
 * @returns Reactive payment requests collection and refetch function.
 * @example
 * const { requests, isLoading } = usePaymentRequests()
 */
export function usePaymentRequests() {
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payment-requests'],
    queryFn: async () => {
      const dtos = await apAdapter.listRequests()
      return dtos.map((dto) => APMapper.toPaymentRequest(dto))
    },
    staleTime: 1000 * 60, // 1 minute
  })

  return { requests, isLoading, error, refetch }
}
