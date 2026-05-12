import type { ListResponse } from '@/shared/domain/pagination'
import { type OperationalEntity } from '@/platform/workflow-runtime/models/workflows.types'
import { WorkflowOperationsSchema } from '@/platform/workflow-runtime/models/workflows.types'

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
 * @returns The flattened OperationalEntity<TDomain>
 */
export function mapOperational<TDTO, TDomain>(
  item: OperationalDTO<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): OperationalEntity<TDomain> {
  return {
    ...mapper(item.data),
    __operations: WorkflowOperationsSchema.parse(item.operations),
  }
}

/**
 * Maps a ListResponse of Operational envelopes.
 *
 * @param response - The raw ListResponse from the API
 * @param mapper - A domain mapper function for individual items
 * @returns A ListResponse of flattened OperationalEntity<TDomain> entities
 */
export function mapOperationalList<TDTO, TDomain>(
  response: OperationalListDTO<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): ListResponse<OperationalEntity<TDomain>> {
  return {
    items: response.items.map((item) => mapOperational(item, mapper)),
    totalCount: response.total_count,
  }
}

/**
 * Strips operational metadata from an entity before serialization/persistence.
 * Prevents __operations leakage back into server-bound payloads.
 *
 * @param entity - The operational entity to strip
 * @returns The pure domain entity without __operations
 */
export function stripOperationalMetadata<T>(entity: OperationalEntity<T>): T {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __operations, ...pureEntity } = entity
  return pureEntity as T
}
