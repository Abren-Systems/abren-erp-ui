/**
 * Core Runtime - Projection Types
 *
 * Defines the canonical projection envelopes for the architecture.
 * This is the ultimate output of the resolution engines and the input
 * to the Rendering and Transition Recorder systems.
 */

export type ProjectionType = 'workspace' | 'screen' | 'semantic'

export type PatchOp = 'replace' | 'remove' | 'append'

export interface PatchOperation {
  op: PatchOp
  path: string
  value?: unknown
}

export interface ProjectionPatch {
  operations: PatchOperation[]
}

/**
 * A formal identity wrapper around any projection state.
 * Enables exact deterministic replay, patching, and versioning.
 */
export interface ProjectionEnvelope<T> {
  /** Uniquely identifies this specific projection shape/model */
  projectionId: string

  /** Identifies the unique execution session (multi-tab/replay separation) */
  runtimeSessionId: string

  /** The runtime that owns this projection */
  projectionType: ProjectionType

  /**
   * The semantic version of the underlying definition schema.
   * Incremented when definitions structurally change.
   */
  schemaVersion: number

  /**
   * The version of the core platform runtime.
   * Enables backward-compatible replays of old snapshots.
   */
  runtimeVersion: string

  /** High-resolution timestamp of projection creation (Observation only!) */
  timestamp: number

  /** Optional tracking identity for specific entity records being projected */
  entityId?: string

  /** The actual projection model (e.g., ScreenProjection, WorkspaceProjection) */
  payload: T
}
