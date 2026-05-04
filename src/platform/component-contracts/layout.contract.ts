// ── Layout Contracts ─────────────────────────────────────────────────────
// These define the structure of the canvas after a Screen is launched.
// The ScreenRenderer takes these contracts and maps them to DOM elements.

/**
 * The Side Panel is the contextual right-pane.
 * It contains multiple tabs, each bound to a specific View.
 */
export interface SidePanelTabContract {
  readonly id: string
  readonly labelKey: string
  readonly icon?: string
  readonly viewName: string // Must match a key in the ScreenDefinition's views
}

export interface SidePanelContract {
  readonly tabs: readonly SidePanelTabContract[]
  readonly defaultTabId?: string
}

/**
 * The Working Area is the primary canvas.
 * Depending on the ScreenKind, it houses either a Grid (for primary lists)
 * or a Form + Tabs (for data entry).
 */
export interface WorkingAreaContract {
  readonly primaryViewName: string
  // Note: Tab definitions for the working area itself (like Details, Taxes, Financial)
  // will be defined in a more advanced FormLayoutContract later.
}

/**
 * The unified Layout Contract emitted by a ScreenDefinition.
 */
export interface ScreenLayoutContract {
  readonly workingArea: WorkingAreaContract
  readonly sidePanel?: SidePanelContract // Optional: only if the screen uses a side panel
}
