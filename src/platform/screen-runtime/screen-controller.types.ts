import type { ComputedRef } from 'vue'
import type { ScreenStateMachine } from './state-machine.types'
import type { ScreenCommand } from '../commands/command.types'

// ── Screen Data (Granular Reactivity) ─────────────────────
// Enforces the memoized selector pattern to prevent re-render storms.

export interface ScreenData<T = unknown> {
  /**
   * Returns a stable computed reference to a specific property of the aggregate.
   * Guarantees that subscribing to 'vendorId' will not re-render when 'currency' changes.
   */
  select<K extends keyof T>(key: K): ComputedRef<T[K] | undefined>

  /**
   * Returns a stable computed reference to a collection/grid within the aggregate.
   */
  selectGrid<K extends keyof T>(gridKey: K): ComputedRef<unknown[]>
}

// ── Screen Controller ─────────────────────────────────────
// The central orchestrator for a screen's aggregate.
// Strictly separates state, data access, commands, and lifecycle.

export interface ScreenController<T = unknown> {
  /** The dual-layered state machine (UI + Domain) */
  readonly state: ScreenStateMachine

  /** The granular data access layer */
  readonly data: ScreenData<T>

  /** The declared commands for this screen (flat data objects) */
  readonly commands: readonly ScreenCommand[]

  /**
   * Internal mutation gateway.
   * UI components NEVER call this directly; they use Commands
   * or the useField/useGrid composables which bridge to this securely.
   */
  _mutate(fn: (draft: T) => void): void

  /** Lifecycle orchestration */
  readonly lifecycle: {
    /** Bootstraps the controller — fetches data or initializes a new draft */
    load(id?: string): Promise<void>
    /** Cleans up subscriptions and releases memory when the instance is closed */
    destroy(): void
  }
}
