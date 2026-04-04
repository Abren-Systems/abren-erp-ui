import { apiGet, apiPost } from '@/shared/api/http-client'
import type {
  UserDTO,
  RoleDTO,
  PermissionDTO,
  RoleCreateDTO,
  UserRoleAssignmentDTO,
} from './api.types'

/**
 * Core Services API Adapter
 * Handles Auth, Tenant, and Identity/RBAC.
 */
export const coreAdapter = {
  // Existing Stub
  async getMe(): Promise<UserDTO> {
    return apiGet<UserDTO>('/core/auth/me')
  },

  // RBAC endpoints
  async getUsers(): Promise<UserDTO[]> {
    return apiGet<UserDTO[]>('/core/users')
  },

  async getRoles(): Promise<RoleDTO[]> {
    return apiGet<RoleDTO[]>('/core/roles')
  },

  async getPermissions(): Promise<PermissionDTO[]> {
    return apiGet<PermissionDTO[]>('/core/permissions')
  },

  async createRole(dto: RoleCreateDTO): Promise<RoleDTO> {
    return apiPost<RoleDTO>('/core/roles', dto)
  },

  async assignRole(dto: UserRoleAssignmentDTO): Promise<void> {
    return apiPost<void>(`/core/users/${dto.user_id}/roles`, { role_id: dto.role_id })
  },
}
