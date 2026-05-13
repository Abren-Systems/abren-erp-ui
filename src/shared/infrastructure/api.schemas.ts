import { z } from 'zod'

/**
 * Creates a paginated response schema for a given item schema.
 * Matches PaginatedListDTO from the backend (Phase 3).
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total_count: z.number().int(),
  })
}

/**
 * Standard payload for workflow state transitions and mutations.
 * Enforces Optimistic Concurrency Control (OCC).
 */
export const StateTransitionRequestSchema = z.object({
  expected_version: z.number().int(),
})

/**
 * Tier 1 — Lightweight operational sidecar for lists and grids.
 */
export const LightweightOperationsSchema = z
  .object({
    version: z.number().int().default(1),
    lifecycle_status: z.string().nullable().optional(),
  })
  .transform((val) => ({
    version: val.version,
    lifecycleStatus: val.lifecycle_status ?? undefined,
  }))

/**
 * Tier 2 — Authoritative projection of current operational capabilities.
 */
export const FullOperationsSchema = z
  .object({
    actions: z.array(
      z
        .object({
          action: z.string(),
          label: z.string(),
          icon: z.string().optional(),
          is_primary: z.boolean().default(false),
          requires_reason: z.boolean().default(false),
        })
        .transform((val) => ({
          action: val.action,
          label: val.label,
          icon: val.icon,
          isPrimary: val.is_primary,
          requiresReason: val.requires_reason,
        })),
    ),
    permissions: z.record(z.string(), z.enum(['editable', 'readonly', 'hidden'])),
    version: z.number().int().default(1),
    lifecycle_status: z.string().nullable().optional(),
  })
  .transform((val) => ({
    actions: val.actions,
    permissions: val.permissions,
    version: val.version,
    lifecycleStatus: val.lifecycle_status ?? undefined,
  }))

/**
 * Creates a Tier 1 (Lightweight) operational response schema.
 * Used for paginated list endpoints.
 */
export function createLightweightOperationalResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean().default(true),
    data: dataSchema,
    operations: LightweightOperationsSchema,
    meta: z.record(z.string(), z.any()).optional(),
  })
}

/**
 * Creates a Tier 2 (Full) operational response schema.
 * Matches OperationalResponse[T] from the backend.
 */
export function createOperationalResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean().default(true),
    data: dataSchema,
    operations: FullOperationsSchema,
    meta: z.record(z.string(), z.any()).optional(),
  })
}
