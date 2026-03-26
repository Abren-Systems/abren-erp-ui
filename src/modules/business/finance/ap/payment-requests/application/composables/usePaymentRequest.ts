import { useQuery } from '@tanstack/vue-query'
import { paymentsAdapter } from '../../infrastructure/payments_adapter'
import { mapToPaymentRequest } from '../../domain/mappers/payment-request.mapper'

export function usePaymentRequest(id: string) {
  const {
    data: request,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payment-requests', id],
    queryFn: async () => {
      const dto = await paymentsAdapter.get(id)
      return mapToPaymentRequest(dto)
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  return { request, isLoading, error }
}
