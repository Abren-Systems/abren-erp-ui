import type { TenantId, UserId } from '@/shared/types/brand.types'
import type { IsoDate } from '@/shared/domain/business-date'

/**
 * User Status
 */
export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
}

/**
 * Core User Entity (Domain Model).
 */
export interface User {
  id: UserId
  email: string
  role: string
  status: UserStatus
  tenantId: TenantId
  lastLoginAt: IsoDate | null
}
