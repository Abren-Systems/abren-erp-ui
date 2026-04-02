import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'
import type { PaymentRequestPayDTO } from '../../infrastructure/api.types'

/**
 * Use Case: Pay an Approved Payment Request.
 *
 * Records the disbursement for an approved payment request, including
 * payment method and reference.
 *
 * @param id - The unique identifier of the payment request to pay.
 * @returns Reactive payment state and mutate function.
 * @example
 * const { pay, isPending } = usePayPaymentRequest('pr_123')
 */
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
