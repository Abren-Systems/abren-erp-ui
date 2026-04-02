import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/ap_adapter'
/**
 * Use Case: Approve a Payment Request.
 *
 * Initiates the approval transition for a pending payment request.
 * Invalidates relevant query keys on success.
 *
 * @param id - The unique identifier of the payment request to approve.
 * @returns Reactive approval state and mutate function.
 * @example
 * const { approve, isPending } = useApprovePaymentRequest('pr_123')
 */
export function useApprovePaymentRequest(id: string) {
  const queryClient = useQueryClient()

  const {
    mutateAsync: approve,
    isPending,
    error,
  } = useApiMutation(
    async () => {
      return await apAdapter.approveRequest(id)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['payment-requests', id] })
        void queryClient.invalidateQueries({ queryKey: ['payment-requests'] })
      },
    },
  )

  return { approve, isPending, error }
}
