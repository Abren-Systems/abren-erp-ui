/**
 * Core Identity & RBAC API DTOs
 */

export interface PermissionDTO {
  resource: string
  action: string
  code: string // e.g. "inventory:write", "ap:approve"
}

export interface RoleDTO {
  id: string
  tenant_id: string
  name: string
  description?: string
  is_system?: boolean
  permissions: string[] // List of permission codes
}

export interface UserRoleDTO {
  role_id: string
  name: string
}

export interface UserDTO {
  id: string
  tenant_id: string
  email: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  roles: UserRoleDTO[]
  last_login_at?: string | null
}

export interface RoleCreateDTO {
  name: string
  description?: string
  permissions: string[]
}

export interface UserRoleAssignmentDTO {
  user_id: string
  role_id: string
}
