import { useQuery } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/adapter'
import { APMapper } from '../../infrastructure/mappers'

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
