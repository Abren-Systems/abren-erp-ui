import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { coreAdapter } from '../infrastructure/core.adapter'
import { IdentityMapper } from '../infrastructure/mappers'
import { coreKeys } from './query-keys'
import type { User } from '../domain/user.types'
import type { CreateUserDTO } from '../infrastructure/api.types'

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
    mutationFn: async (payload: { userId: string; roleId: string }) => {
      await coreAdapter.assignRole(payload.userId, { role_id: payload.roleId })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coreKeys.users() })
    },
  })

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: async (payload: CreateUserDTO) => {
      return await coreAdapter.createUser(payload)
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
    createUser,
    isCreating,
  }
}
