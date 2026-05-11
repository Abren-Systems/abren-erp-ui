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
