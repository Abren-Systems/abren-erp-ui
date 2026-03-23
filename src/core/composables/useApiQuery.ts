import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'

/**
 * useApiQuery
 *
 * A wrapper around TanStack useQuery that ensures consistent
 * error handling and type-safety across the ERP.
 */
export function useApiQuery<TData, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>,
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes default
    ...options,
  })
}
