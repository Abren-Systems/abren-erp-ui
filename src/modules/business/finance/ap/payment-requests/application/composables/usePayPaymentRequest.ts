import { useApiMutation } from '@/core/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { paymentsAdapter } from '../../infrastructure/payments_adapter'

export function usePayPaymentRequest() {
  const queryClient = useQueryClient()

  return useApiMutation(
    async ({
      id,
      paymentMethod,
      disbursementReference,
    }: {
      id: string
      paymentMethod: string
      disbursementReference: string
    }) => {
      await paymentsAdapter.pay(id, {
        payment_method: paymentMethod,
        disbursement_reference: disbursementReference,
      })
      return id
    },
    {
      onSuccess: (id: string) => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
        void queryClient.invalidateQueries({ queryKey: ['payment-requests', id] })
      },
    },
  )
}
