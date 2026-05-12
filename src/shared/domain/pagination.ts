/**
 * Shared pagination types for Offset-based navigation.
 * Standardized across all ERP transactional grids.
 */

export interface ListQuery {
  limit?: number
  offset?: number
  [key: string]: string | number | boolean | undefined
}

export interface ListResponse<T> {
  items: T[]
  totalCount: number
}
