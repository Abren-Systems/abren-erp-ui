import type { ComputedRef, Ref } from 'vue'
import type { ScreenStateMachine } from './state-machine.types'

export interface ScreenContext {
  /** The current route parameters for dynamic resolution */
  params: Record<string, string | string[]>
  /** Querystring parameters */
  query: Record<string, string | string[]>
}

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

import type { ScreenDefinition } from './screen-definition.types'
import type { ScreenModel } from './screen-model.types'

export interface ControllerCommand {
  /** Execute this command */
  execute: (...args: unknown[]) => Promise<void>
  /** Whether the command is currently executing */
  isPending: Ref<boolean>
}

// ── Screen Controller ─────────────────────────────────────
// The central orchestrator for a screen's aggregate.
// Strictly separates state, data access, commands, and lifecycle.

export interface ScreenController<T = unknown, TDomain extends string = string> {
  /** The ScreenDefinition metadata */
  readonly screen: ScreenDefinition

  /** Granular, memoized data access */
  readonly data: ScreenData<T>

  /** The primary entity ref (for direct access when selectors aren't needed) */
  readonly entity: Ref<T | null | undefined>

  /** UI state machine */
  readonly state: ScreenStateMachine<TDomain>

  /** The unified screen model — single deterministic rendering contract */
  readonly model: ComputedRef<ScreenModel>

  /** Whether the data source is loading */
  readonly isLoading: Ref<boolean>

  /** Error from the data source */
  readonly error: Ref<Error | null | undefined>

  /** Whether this is a new record */
  readonly isNew: Ref<boolean>

  /** Registered commands */
  readonly commands: Ref<Record<string, ControllerCommand>>

  /** Whether any command is currently executing */
  readonly isPending: ComputedRef<boolean>

  /** Register a command on this controller */
  registerCommand(id: string, command: ControllerCommand): void
}
