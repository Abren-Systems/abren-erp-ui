import type { User, UserStatus } from '../domain/user.types'
import type { UserDTO } from './api.types'

/**
 * Core Domain Mapper.
 *
 * Handles common transformations for the platform engine (Users, Tenants).
 */
export class CoreMapper {
  /**
   * Transforms a raw API user response into a Domain User entity.
   */
  static toUser(dto: UserDTO): User {
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
