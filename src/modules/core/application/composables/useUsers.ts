import { useQuery } from '@tanstack/vue-query'
import { coreAdapter } from '../../infrastructure/core_adapter'
import { CoreMapper } from '../../infrastructure/mappers'

/**
 * Use Case: View Tenant Users.
 *
 * Fetches the list of users and maps them to domain entities.
 *
 * @returns Reactive list of users and loading state.
 * @example
 * const { users, isLoading } = useUsers()
 */
export function useUsers() {
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['core', 'users'],
    queryFn: async () => {
      const dtos = await coreAdapter.listUsers()
      return dtos.map((dto) => CoreMapper.toUser(dto))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    users,
    isLoading,
    error,
    refresh: refetch,
  }
}
