import type { TenantInfoDTO, UserProfileDTO } from './api.types'
import type { CurrentUser, TenantInfo } from '../auth.store'

/**
 * Mapper-as-Factory for Shared Auth.
 *
 * Enforces a strict separation between raw Identity DTOs and the
 * global shared frontend state representations.
 */
export class AuthMapper {
  /**
   * Translates a raw UserProfile response into the strictly typed
   * CurrentUser store subset.
   *
   * @param dto - The raw API response payload.
   * @returns High-integrity CurrentUser.
   */
  static toCurrentUser(dto: UserProfileDTO): CurrentUser {
    return {
      id: dto.id,
      tenantId: dto.tenant_id,
      email: dto.email,
      isActive: dto.is_active,
    }
  }

  /**
   * Translates a raw TenantInfo response into the TenantInfo store subset.
   *
   * @param dto - The raw API response payload.
   * @returns High-integrity TenantInfo.
   */
  static toTenantInfo(dto: TenantInfoDTO): TenantInfo {
    return {
      id: dto.id,
      name: dto.name,
      features: { ...dto.features },
    }
  }
}
