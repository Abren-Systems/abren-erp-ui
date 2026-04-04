import { toId } from '@/shared/types/brand.types'
import type { TenantId, UserId, RoleId } from '@/shared/types/brand.types'
import type { UserDTO, RoleDTO, UserRoleDTO } from './api.types'
import type { User, Role, UserRoleAssignment } from '../domain/user.types'

/**
 * Identity Mapper
 * Protects domain logic from external API payload drift.
 */
export class IdentityMapper {
  static toRole(dto: RoleDTO): Role {
    return {
      id: toId<RoleId>(dto.id),
      tenantId: toId<TenantId>(dto.tenant_id),
      name: dto.name,
      description: dto.description ?? null,
      isSystem: dto.is_system ?? false,
      permissions: dto.permissions ?? [],
    }
  }

  static toUserRoleAssignment(dto: UserRoleDTO): UserRoleAssignment {
    return {
      roleId: toId<RoleId>(dto.role_id),
      name: dto.name,
    }
  }

  static toUser(dto: UserDTO): User {
    return {
      id: toId<UserId>(dto.id),
      tenantId: toId<TenantId>(dto.tenant_id),
      email: dto.email,
      status: dto.status,
      roles: (dto.roles ?? []).map((r) => this.toUserRoleAssignment(r)),
      lastLoginAt: dto.last_login_at ? new Date(dto.last_login_at) : null,
    }
  }
}
