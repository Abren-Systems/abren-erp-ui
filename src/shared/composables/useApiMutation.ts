import { useMutation, type UseMutationOptions } from '@tanstack/vue-query'

/**
 * useApiMutation
 *
 * A wrapper around TanStack useMutation that provides
 * ERP-optimized defaults for mutating data.
 *
 * @example
 * const { mutateAsync } = useApiMutation((data) => api.updateUser(data))
 */
export function useApiMutation<TData, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn,
    ...options,
  })
}
