import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenControllerInstance } from './useScreenController'

/**
 * ScreenInstance — The fundamental unit of the runtime workspace.
 *
 * Represents an active, stateful screen loaded into memory.
 * This separates the static ScreenDefinition from the live, stateful Controller.
 */
export interface ScreenInstance<TEntity = unknown> {
  /** Unique ID for this exact instance (e.g., 'new', UUID, or static PL id) */
  readonly instanceId: string
  /** The static screen definition from the registry */
  readonly definition: ScreenDefinition
  /** The initialized, authoritative controller governing this instance */
  readonly controller: ScreenControllerInstance<TEntity>
  /** ISO timestamp of last user interaction, useful for keeping LRU caches clean */
  lastAccessedAt: string
}
