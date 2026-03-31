import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/adapter'

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
