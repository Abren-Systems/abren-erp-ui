import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { coreAdapter } from '../../infrastructure/core_adapter'
import { IdentityMapper } from '../../infrastructure/mappers'
import { coreKeys } from '../keys'
import type { User } from '../../domain/user.types'
import type { UserRoleAssignmentDTO } from '../../infrastructure/api.types'

/**
 * Use Case: Manage Users and Assignments
 */
export function useUsers() {
  const queryClient = useQueryClient()

  const {
    data: users,
    isPending,
    error,
    refetch,
  } = useQuery<User[], Error>({
    queryKey: coreKeys.users(),
    queryFn: async () => {
      const dtos = await coreAdapter.getUsers()
      return dtos.map((dto) => IdentityMapper.toUser(dto))
    },
    staleTime: 1000 * 60 * 5,
  })

  const { mutateAsync: assignRole, isPending: isAssigning } = useMutation({
    mutationFn: async (payload: UserRoleAssignmentDTO) => {
      await coreAdapter.assignRole(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coreKeys.users() })
    },
  })

  return {
    users,
    isPending,
    error,
    refetch,
    assignRole,
    isAssigning,
  }
}
