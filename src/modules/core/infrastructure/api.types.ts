import type { components } from '@/shared/api/generated.types'

type Schemas = components['schemas']

export type RoleDTO = Schemas['RoleDTO']
export type UserRoleDTO = Schemas['UserRoleDTO']
export type UserDTO = Schemas['UserDTO']
export type PermissionDTO = Schemas['PermissionDTO']
export type CreateRoleDTO = Schemas['CreateRoleRequest']
export type AssignRoleDTO = Schemas['AssignRoleRequest']
export type CreateUserDTO = Schemas['CreateUserRequest']
export type TenantSettingDTO = Schemas['TenantSettingDTO']
