import type { components } from '@/shared/api/generated.types'

type Schemas = components['schemas']

export type RoleDTO = Schemas['RoleSchema']

export type UserRoleDTO = Schemas['UserRoleSchema']

export type UserDTO = Schemas['UserSchema']

export type PermissionDTO = Schemas['PermissionSchema']

export type CreateRoleDTO = Schemas['CreateRoleRequest']

export type AssignRoleDTO = Schemas['AssignRoleRequest']

export type CreateUserDTO = Schemas['CreateUserRequest']

export type TenantSettingDTO = Schemas['TenantSettingSchema']
