import type { ScreenId, ScreenInstanceId } from '../screen-runtime/screen-id.types'

// ── Screen Instance ───────────────────────────────────────
// Represents an open tab. Multiple instances of the same ScreenId
// can coexist (e.g., editing Bill A and viewing Bill B).
// The dirty flag and lastAccessedAt enable Acumatica-style
// work preservation across search/help/recently-viewed overlays.

export interface ScreenInstance<TContext = unknown> {
  /** A globally unique identifier for this open tab */
  readonly instanceId: ScreenInstanceId

  /** The registered ScreenDefinition this instance belongs to */
  readonly screenId: ScreenId

  /** Context used to initialize (e.g., { id: '...' } or defaults for new) */
  readonly context: TContext

  /** Whether the screen has unsaved mutations */
  dirty: boolean

  /** ISO timestamp of last user interaction — for recently viewed ordering */
  lastAccessedAt: string

  /** Display title for the tab (e.g., 'PR-00042' or 'New Payment Request') */
  title: string
}

// ── Workspace ─────────────────────────────────────────────
// The top-level orchestrator replacing standard SPA routing.
// Manages multiple open ScreenInstances and tracks the active viewport.

export interface Workspace {
  /** All currently open screen instances */
  readonly instances: Map<string, ScreenInstance>

  /** The instanceId of the currently visible screen */
  readonly activeInstanceId: string | null

  /**
   * Opens a screen. If an identical instance exists (same screenId + context),
   * focuses that instance instead of creating a duplicate.
   */
  openScreen(screenId: ScreenId, context?: unknown): void

  /**
   * Closes a screen instance. Triggers the Controller's lifecycle.destroy()
   * and releases memory. Should prompt if dirty.
   */
  closeScreen(instanceId: ScreenInstanceId): void

  /** Switches the active viewport to an already-open instance */
  focusScreen(instanceId: ScreenInstanceId): void
}
