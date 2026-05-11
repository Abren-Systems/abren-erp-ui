import { z } from 'zod'

/**
 * Creates a paginated response schema for a given item schema.
 * Matches PaginatedListDTO from the backend (Phase 3).
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    next_cursor: z.string().nullable().optional(),
    total_count: z.number().int().nullable().optional(),
  })
}

/**
 * Authoritative projection of current operational capabilities.
 */
export const WorkflowOperationsSchema = z.object({
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
})

/**
 * Creates an operational response schema for a given item schema.
 * Matches OperationalResponse[T] from the backend.
 */
export function createOperationalResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean().default(true),
    data: dataSchema,
    operations: WorkflowOperationsSchema,
    meta: z.record(z.string(), z.any()).optional(),
  })
}
