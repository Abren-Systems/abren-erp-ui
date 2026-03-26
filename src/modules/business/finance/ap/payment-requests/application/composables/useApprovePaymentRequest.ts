import { useApiMutation } from '@/core/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { paymentsAdapter } from '../../infrastructure/payments_adapter'

export function useApprovePaymentRequest() {
  const queryClient = useQueryClient()

  return useApiMutation(
    async (id: string) => {
      await paymentsAdapter.approve(id)
      return id
    },
    {
      onSuccess: (id: string) => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
        void queryClient.invalidateQueries({ queryKey: ['payment-requests', id] })
        void queryClient.invalidateQueries({ queryKey: ['workflow-pending-tasks'] })
      },
    },
  )
}
