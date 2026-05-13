import type { ListResponse } from '@/shared/domain/pagination'
import {
  type OperationalEntity,
  type LightweightOperationalEntity,
  FullOperationsSchema,
  LightweightOperationsSchema,
} from '@/platform/workflow-runtime/models/workflows.types'

// ---------------------------------------------------------------------------
// Raw DTO Shapes
// ---------------------------------------------------------------------------

/**
 * Raw DTO shape for a Tier 2 operational envelope.
 */
export interface OperationalDTO<T> {
  data: T
  operations: unknown
}

/**
 * Raw DTO shape for a Tier 1 lightweight operational envelope.
 */
export interface LightweightOperationalDTO<T> {
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
 * Raw DTO shape for a paginated list of lightweight operational envelopes.
 */
export interface LightweightOperationalListDTO<T> {
  items: LightweightOperationalDTO<T>[]
  total_count: number
}

// ---------------------------------------------------------------------------
// Tier 2 (Full) Mappers
// ---------------------------------------------------------------------------

/**
 * Maps an API item wrapped in a Tier 2 Operational envelope.
 *
 * @param item - The raw item from the API (with .data and .operations)
 * @param mapper - A domain mapper function to convert the internal DTO to a Domain Entity
 * @returns The flattened OperationalEntity<TDomain> (nominally branded as 'full')
 */
export function mapOperational<TDTO, TDomain>(
  item: OperationalDTO<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): OperationalEntity<TDomain> {
  return {
    ...mapper(item.data),
    __operations: FullOperationsSchema.parse(item.operations),
  } as OperationalEntity<TDomain>
}

/**
 * Maps a ListResponse of Tier 2 Operational envelopes.
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

// ---------------------------------------------------------------------------
// Tier 1 (Lightweight) Mappers
// ---------------------------------------------------------------------------

/**
 * Maps an API item wrapped in a Tier 1 Lightweight envelope.
 *
 * @param item - The raw item from the API (with .data and .operations)
 * @param mapper - A domain mapper function to convert the internal DTO to a Domain Entity
 * @returns The flattened LightweightOperationalEntity<TDomain> (nominally branded as 'lightweight')
 */
export function mapLightweightOperational<TDTO, TDomain>(
  item: LightweightOperationalDTO<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): LightweightOperationalEntity<TDomain> {
  return {
    ...mapper(item.data),
    __operations: LightweightOperationsSchema.parse(item.operations),
  } as LightweightOperationalEntity<TDomain>
}

/**
 * Maps a ListResponse of Tier 1 Lightweight operational envelopes.
 *
 * @param response - The raw ListResponse from the API
 * @param mapper - A domain mapper function for individual items
 * @returns A ListResponse of flattened LightweightOperationalEntity<TDomain> entities
 */
export function mapLightweightOperationalList<TDTO, TDomain>(
  response: LightweightOperationalListDTO<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): ListResponse<LightweightOperationalEntity<TDomain>> {
  return {
    items: response.items.map((item) => mapLightweightOperational(item, mapper)),
    totalCount: response.total_count,
  }
}

// ---------------------------------------------------------------------------
// Projection Guards (ADR-0018)
// ---------------------------------------------------------------------------

/**
 * Asserts that an entity carries a Tier 2 (Full) operational projection.
 * Centralise this inside platform capability boundaries (e.g. useCommandBar).
 *
 * @throws Error if the entity is a Tier 1 lightweight projection
 */
export function assertFullProjection<T>(
  entity: LightweightOperationalEntity<T> | OperationalEntity<T>,
): asserts entity is OperationalEntity<T> {
  if (!('actions' in entity.__operations)) {
    throw new Error(
      'Tier Downgrade Forbidden: Attempted to evaluate full workflow graph on a Lightweight projection.',
    )
  }
}

// ---------------------------------------------------------------------------
// Utility: Strip Operational Metadata
// ---------------------------------------------------------------------------

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
