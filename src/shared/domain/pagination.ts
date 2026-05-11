/**
 * Shared pagination types for Keyset (Cursor-based) navigation.
 * Standardized across all list views (Phase 3).
 */

export interface ListQuery {
  limit?: number
  cursor?: string
  offset?: number
  [key: string]: string | number | boolean | undefined
}

export interface ListResponse<T> {
  items: T[]
  nextCursor?: string | null
  totalCount?: number | null
}
