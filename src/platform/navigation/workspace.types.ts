import type { ScreenId, ScreenInstanceId } from '../screen-runtime/screen-id.types'
import type { ScreenInstance } from '../screen-runtime/screen-instance.types'

// ScreenInstance is now exported from @/platform/screen-runtime

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
