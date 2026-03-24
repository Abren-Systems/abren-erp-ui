import { useApiMutation } from '@/core/composables/useApiMutation'
import { paymentsAdapter } from '../../infrastructure/payments_adapter'
import { useQueryClient } from '@tanstack/vue-query'
import { eventBus } from '@/core/event-bus/event-bus'

export function useSubmitPaymentRequest() {
  const queryClient = useQueryClient()

  return useApiMutation(
    async (id: string) => {
      await paymentsAdapter.submit(id)
    },
    {
      onSuccess: () => {
        // Invalidate both PR list and Workflow task list
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
        void queryClient.invalidateQueries({ queryKey: ['workflow-pending-tasks'] })

        // Emit global event
        eventBus.emit('payment-request:submitted', { id: '' }) // ID in payload if needed
      },
    },
  )
}
