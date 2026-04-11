import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type { ApiError } from '../api/http-client'

/**
 * useApiQuery
 *
 * A wrapper around TanStack useQuery that ensures consistent
 * error handling and type-safety across the ERP.
 *
 * @example
 * const { data, isLoading } = useApiQuery(['user', id], () => api.getUser(id))
 */
export function useApiQuery<TData, TError = ApiError>(
  queryKey: MaybeRefOrGetter<QueryKey>,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery(() => ({
    queryKey: toValue(queryKey),
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes default
    ...options,
  }))
}
