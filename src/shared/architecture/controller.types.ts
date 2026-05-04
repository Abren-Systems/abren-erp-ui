import type { ComputedRef } from 'vue'
import type { ScreenStateMachine } from './state-machine.types'
import type { Command } from './command.types'

/**
 * A reactive wrapper around the aggregate data.
 * It enforces granular reactivity via the `select` pattern,
 * preventing re-render storms on large forms.
 */
export interface ScreenData<T = unknown> {
  /**
   * Returns a stable computed reference to a specific property of the aggregate.
   * This guarantees that a component subscribing to 'vendorId' will not re-render
   * when 'currency' changes.
   */
  select<K extends keyof T>(key: K): ComputedRef<T[K] | undefined>

  /**
   * Returns a stable computed reference to a collection/grid within the aggregate.
   */
  selectGrid<K extends keyof T>(gridKey: K): ComputedRef<unknown[]>
}

/**
 * The central orchestrator for an aggregate.
 * It strictly separates state, data access, commands, and lifecycle,
 * preventing the anti-pattern of a "god object".
 */
export interface ScreenController<T = unknown> {
  /** The dual-layered state machine (UI + Domain) */
  readonly state: ScreenStateMachine

  /** The granular data access layer */
  readonly data: ScreenData<T>

  /** The registered commands available to this screen */
  readonly commands: Record<string, Command<T>>

  /**
   * Internal mutation gateway.
   * UI components NEVER call this directly; they use specific Commands
   * or the provided `useField/useGrid` composables which bridge to this securely.
   */
  _mutate(fn: (draft: T) => void): void

  /** Lifecycle Orchestration */
  readonly lifecycle: {
    /** Bootstraps the controller, typically fetching data via ID or initializing a new draft */
    load(id?: string): Promise<void>
    /** Cleans up subscriptions and releases memory when the instance is closed */
    destroy(): void
  }
}
