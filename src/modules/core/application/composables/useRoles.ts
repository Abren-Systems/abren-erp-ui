import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { coreAdapter } from '../../infrastructure/core_adapter'
import { IdentityMapper } from '../../infrastructure/mappers'
import { coreKeys } from '../keys'
import type { Role } from '../../domain/user.types'
import type { RoleCreateDTO } from '../../infrastructure/api.types'

/**
 * Use Case: Manage Roles and Permissions
 */
export function useRoles() {
  const queryClient = useQueryClient()

  const {
    data: roles,
    isPending: isRolesPending,
    error: rolesError,
    refetch: refetchRoles,
  } = useQuery<Role[], Error>({
    queryKey: coreKeys.roles(),
    queryFn: async () => {
      const dtos = await coreAdapter.getRoles()
      return dtos.map((dto) => IdentityMapper.toRole(dto))
    },
    staleTime: 1000 * 60 * 5,
  })

  const { data: permissions, isPending: isPermissionsPending } = useQuery({
    queryKey: coreKeys.permissions(),
    queryFn: async () => {
      return await coreAdapter.getPermissions()
    },
    staleTime: 1000 * 60 * 60,
  })

  const { mutateAsync: createRole, isPending: isCreating } = useMutation({
    mutationFn: async (payload: RoleCreateDTO) => {
      await coreAdapter.createRole(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: coreKeys.roles() })
    },
  })

  return {
    roles,
    isRolesPending,
    rolesError,
    refetchRoles,
    permissions,
    isPermissionsPending,
    createRole,
    isCreating,
  }
}
