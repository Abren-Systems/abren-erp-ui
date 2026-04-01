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
  id: string
  email: string
  role: string
  status: UserStatus
  tenantId: string
  lastLoginAt: Date | null
}
