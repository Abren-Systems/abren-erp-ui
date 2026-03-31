import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/adapter'
import type { PaymentRequestRejectDTO } from '../../infrastructure/api.types'

export function useRejectPaymentRequest(id: string) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: reject,
    isPending,
    error,
  } = useApiMutation(
    async (reason: string) => {
      const dto: PaymentRequestRejectDTO = { reason }
      return await apAdapter.rejectRequest(id, dto)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests', id] })
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
      },
    },
  )

  return { reject, isPending, error }
}
