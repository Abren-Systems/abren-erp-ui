import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'
import type { PaymentRequestRejectDTO } from '../../infrastructure/api.types'

/**
 * Use Case: Reject a Payment Request.
 *
 * Marks a payment request as rejected with a mandatory reason.
 *
 * @param id - The unique identifier of the payment request to reject.
 * @returns Reactive rejection state and mutate function.
 * @example
 * const { reject, isPending } = useRejectPaymentRequest('pr_123')
 */
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
