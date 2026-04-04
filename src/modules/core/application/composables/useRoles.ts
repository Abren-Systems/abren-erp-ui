import { useQuery } from '@tanstack/vue-query'
import { coreAdapter } from '../../infrastructure/core_adapter'
import { IdentityMapper } from '../../infrastructure/mappers'
import { coreKeys } from '../keys'
import type { Role } from '../../domain/user.types'

/**
 * Use Case: Manage Roles and Permissions
 */
export function useRoles() {
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
      return await coreAdapter.getPermissions() // Raw DTOs are fine for simple text representations
    },
    staleTime: 1000 * 60 * 60, // Rarely changes
  })

  return {
    roles,
    isRolesPending,
    rolesError,
    refetchRoles,
    permissions,
    isPermissionsPending,
  }
}
