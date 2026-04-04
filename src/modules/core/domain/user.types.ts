import type { UserId, TenantId, RoleId } from '@/shared/types/brand.types'

export interface Role {
  id: RoleId
  tenantId: TenantId
  name: string
  description: string | null
  isSystem: boolean
  permissions: string[]
}

export interface UserRoleAssignment {
  roleId: RoleId
  name: string
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING'

export interface User {
  id: UserId
  tenantId: TenantId
  email: string
  status: UserStatus
  roles: UserRoleAssignment[]
  lastLoginAt: Date | null
}
