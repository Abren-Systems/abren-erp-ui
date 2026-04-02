import { toId, type UserId, type TenantId } from '@/shared/types/brand.types'
import { BusinessDate } from '@/shared/domain/business-date'
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
      id: toId<UserId>(dto.id),
      email: dto.email,
      role: dto.role || 'User',
      status: (dto.status as UserStatus) || 'Active',
      tenantId: toId<TenantId>(dto.tenant_id),
      lastLoginAt: dto.last_login_at ? BusinessDate.fromIso(dto.last_login_at) : null,
    }
  }
}
