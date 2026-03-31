import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/adapter'
import type { PaymentRequestPayDTO } from '../../infrastructure/api.types'

export function usePayPaymentRequest(id: string) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: pay,
    isPending,
    error,
  } = useApiMutation(
    async (dto: PaymentRequestPayDTO) => {
      return await apAdapter.payRequest(id, dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests', id] })
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
      },
    },
  )

  return { pay, isPending, error }
}
