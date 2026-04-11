import { useApiQuery } from './useApiQuery'
import type { UseQueryOptions, QueryKey } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { ApiError } from '../api/http-client'

/**
 * useResourceQuery — Higher-order composable for domain resource fetching.
 *
 * Automates the pattern of:
 * 1. Fetching DTOs via an Adapter.
 * 2. Mapping DTOs to Domain Models via a Mapper.
 * 3. Handling server state via TanStack Query.
 *
 * @param queryKey - Unique key for the query cache.
 * @param adapterFn - The API method that returns DTO(s).
 * @param mapperFn - The mapper method that transforms DTO(s) to Domain Model(s).
 * @param options - Additional TanStack Query options.
 */
export function useResourceQuery<TDTO, TDomain, TError = ApiError>(
  queryKey: MaybeRefOrGetter<QueryKey>,
  adapterFn: () => Promise<TDTO>,
  mapperFn: (dto: TDTO) => TDomain,
  options?: Omit<UseQueryOptions<TDomain, TError>, 'queryKey' | 'queryFn'>,
) {
  return useApiQuery<TDomain, TError>(
    queryKey,
    async () => {
      const dto = await adapterFn()
      return mapperFn(dto)
    },
    {
      staleTime: 1000 * 60, // 1 minute default for domain resources
      ...options,
    },
  )
}
