import { useQuery } from '@tanstack/vue-query'
import { paymentsAdapter } from '../../infrastructure/payments_adapter'
import { mapToPaymentRequest } from '../../domain/mappers/payment-request.mapper'

export function usePaymentRequests() {
  const {
    data: requests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payment-requests'],
    queryFn: async () => {
      const dtos = await paymentsAdapter.list()
      return dtos.map(mapToPaymentRequest)
    },
    staleTime: 1000 * 60, // 1 minute
  })

  return { requests, isLoading, error, refresh: refetch }
}
