import { useApiMutation } from '@/shared/composables/useApiMutation'
import { useQueryClient } from '@tanstack/vue-query'
import { apAdapter } from '../../infrastructure/adapter'

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
