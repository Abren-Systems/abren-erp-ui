import type { TenantInfoDTO, UserProfileDTO } from "./api.types";
import type { CurrentUser, TenantInfo } from "../auth.store";
import { toId, type UserId, type TenantId } from "@/shared/types/brand.types";

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
      id: toId<UserId>(dto.id),
      tenantId: toId<TenantId>(dto.tenant_id),
      email: dto.email,
      isActive: dto.is_active,
      permissions: dto.permissions ?? [],
    };
  }

  /**
   * Translates a raw TenantInfo response into the TenantInfo store subset.
   *
   * @param dto - The raw API response payload.
   * @returns High-integrity TenantInfo.
   */
  static toTenantInfo(dto: TenantInfoDTO): TenantInfo {
    return {
      id: toId<TenantId>(dto.id),
      name: dto.name,
      features: { ...dto.features },
    };
  }
}
