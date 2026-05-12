import type { ListResponse } from '@/shared/domain/pagination'
import type { Operational, WorkflowOperations } from '../models/workflows.types'

/**
 * Raw DTO shape for an operational envelope.
 */
export interface OperationalDTO<T> {
  data: T
  operations: unknown
}

/**
 * Raw DTO shape for a paginated list of operational envelopes.
 */
export interface OperationalListDTO<T> {
  items: OperationalDTO<T>[]
  total_count: number
}

/**
 * Maps an API item that is wrapped in an Operational envelope.
 *
 * @param item - The raw item from the API (with .data and .operations)
 * @param mapper - A domain mapper function to convert the internal DTO to a Domain Entity
 * @returns The flattened Operational<T> domain entity
 */
export function mapOperational<TDTO, TDomain>(
  item: OperationalDTO<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): Operational<TDomain> {
  return {
    ...mapper(item.data),
    __operations: item.operations as unknown as WorkflowOperations,
  }
}

/**
 * Maps a ListResponse of Operational envelopes.
 *
 * @param response - The raw ListResponse from the API
 * @param mapper - A domain mapper function for individual items
 * @returns A ListResponse of flattened Operational<TDomain> entities
 */
export function mapOperationalList<TDTO, TDomain>(
  response: OperationalListDTO<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): ListResponse<Operational<TDomain>> {
  return {
    items: response.items.map((item) => mapOperational(item, mapper)),
    totalCount: response.total_count,
  }
}
