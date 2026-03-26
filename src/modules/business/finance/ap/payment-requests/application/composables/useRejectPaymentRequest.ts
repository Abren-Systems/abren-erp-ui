import { useApiMutation } from '@/core/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { paymentsAdapter } from '../../infrastructure/payments_adapter'

export function useRejectPaymentRequest() {
  const queryClient = useQueryClient()

  return useApiMutation(
    async ({ id, reason }: { id: string; reason: string }) => {
      await paymentsAdapter.reject(id, { reason })
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
