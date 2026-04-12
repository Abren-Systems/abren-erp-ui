import { z } from 'zod'

/**
 * Core Identity & RBAC Zod Boundary Schemas
 * Used for runtime validation at the infrastructure edge.
 */

export const PermissionSchema = z.object({
  code: z.string(),
  resource: z.string(),
  action: z.string(),
})

export const RoleSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  is_system: z.boolean().optional(),
  permissions: z.array(z.string()),
})

export const UserRoleSchema = z.object({
  role_id: z.string().uuid(),
  name: z.string(),
})

export const UserSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  email: z.string().email(),
  status: z.string(), // Backend sends "ACTIVE" or "INACTIVE"
  roles: z.array(UserRoleSchema),
})

export const RoleCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  permissions: z.array(z.string()),
})

export const UserRoleAssignmentSchema = z.object({
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
})

// Validation types inferred from schemas
export type UserSchemaType = z.infer<typeof UserSchema>
export type RoleSchemaType = z.infer<typeof RoleSchema>
