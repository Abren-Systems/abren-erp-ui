import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'

/**
 * Use Case: Submit a Payment Request for Approval.
 *
 * Transitions a draft payment request to the submitted state,
 * initiating the workflow.
 *
 * @param id - The unique identifier of the payment request to submit.
 * @returns Reactive submission state and mutate function.
 * @example
 * const { submit, isPending } = useSubmitPaymentRequest('pr_123')
 */
export function useSubmitPaymentRequest(id: string) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: submit,
    isPending,
    error,
  } = useApiMutation(
    async () => {
      return await apAdapter.submitRequest(id)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests', id] })
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
      },
    },
  )

  return { submit, isPending, error }
}
