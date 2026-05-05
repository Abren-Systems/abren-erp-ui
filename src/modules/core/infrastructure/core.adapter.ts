import { apiGet, apiPost } from '@/shared/api/http-client'
import { UserSchema, RoleSchema, PermissionSchema } from './api.schemas'
import type {
  UserDTO,
  RoleDTO,
  PermissionDTO,
  RoleCreateDTO,
  UserCreateDTO,
  UserRoleAssignmentDTO,
  TenantSettingDTO,
} from './api.types'
import { z } from 'zod'

/**
 * Core Services API Adapter
 * Handles Auth, Tenant, and Identity/RBAC.
 */
export const coreAdapter = {
  // Existing Stub
  async getMe(): Promise<UserDTO> {
    const data = await apiGet<unknown>('/core/auth/me')
    return UserSchema.parse(data) as UserDTO
  },

  // RBAC endpoints
  async getUsers(): Promise<UserDTO[]> {
    const data = await apiGet<unknown>('/core/users')
    return z.array(UserSchema).parse(data) as UserDTO[]
  },

  async getRoles(): Promise<RoleDTO[]> {
    const data = await apiGet<unknown>('/core/roles')
    return z.array(RoleSchema).parse(data) as RoleDTO[]
  },

  async getPermissions(): Promise<PermissionDTO[]> {
    const data = await apiGet<unknown>('/core/permissions')
    return z.array(PermissionSchema).parse(data) as PermissionDTO[]
  },

  async createRole(dto: RoleCreateDTO): Promise<{ role_id: string }> {
    const data = await apiPost<unknown>('/core/roles', dto)
    return z.object({ role_id: z.string().uuid() }).parse(data)
  },

  async assignRole(dto: UserRoleAssignmentDTO): Promise<void> {
    // Note: apiPost for void typically doesn't need parse check if status is 204
    return apiPost<void>(`/core/users/${dto.user_id}/roles`, {
      role_id: dto.role_id,
    })
  },

  async createUser(dto: UserCreateDTO): Promise<UserDTO> {
    const data = await apiPost<unknown>('/core/users', dto)
    return UserSchema.parse(data) as UserDTO
  },

  async getSettings(): Promise<TenantSettingDTO[]> {
    const data = await apiGet<unknown>('/core/settings')
    return z
      .array(z.object({ key: z.string(), value: z.string().nullable() }))
      .parse(data) as TenantSettingDTO[]
  },

  async updateSetting(key: string, value: string | null): Promise<void> {
    return apiPost<void>(`/core/settings/${key}`, { value })
  },
}
