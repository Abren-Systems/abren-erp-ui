import type { User, UserStatus } from '../domain/user.types'

/**
 * Core Domain Mapper.
 *
 * Handles common transformations for the platform engine (Users, Tenants).
 */
export class CoreMapper {
  /**
   * Transforms a raw API user response into a Domain User entity.
   */
  static toUser(dto: {
    id: string
    email: string
    role?: string
    status?: string
    tenant_id: string
    last_login_at?: string | null
  }): User {
    return {
      id: dto.id,
      email: dto.email,
      role: dto.role || 'User',
      status: (dto.status as UserStatus) || 'Active',
      tenantId: dto.tenant_id,
      lastLoginAt: dto.last_login_at ? new Date(dto.last_login_at) : null,
    }
  }
}
