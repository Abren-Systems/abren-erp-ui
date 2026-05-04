import type { ScreenId } from '../screen-runtime/screen-id.types'

// ── Layout Contracts ─────────────────────────────────────────────────────
// These define the structure of the canvas after a Screen is launched.
// The ScreenRenderer takes these contracts and maps them to DOM elements.

// ── Side Panel ───────────────────────────────────────────────────────────
// The Side Panel is the contextual right-pane with an icon strip.
// Platform owns: the icon strip, collapse/expand toggle, panel chrome.
// Screens declare: which tabs to show and what content they render.
//
// Each tab can be one of two kinds:
//   1. A local view — content defined within the same screen module
//   2. A screen reference — a full mini-screen from another module
//      (e.g., "Contacts" tab on a Business Accounts list)

/**
 * A Side Panel tab that renders a local view from the same screen.
 * The content component lives in the screen's sidepanels/ folder.
 */
export interface SidePanelLocalTab {
  readonly kind: 'local'
  readonly id: string
  readonly labelKey: string
  readonly icon: string
  readonly component: () => Promise<unknown> // Explicit lazy import of the content component
}

/**
 * A Side Panel tab that renders an external screen inline.
 * The content is a full mini-screen (with its own header, toolbar, sub-tabs).
 * The platform binds the contextual ID (selected row) to the target screen's primary key.
 */
export interface SidePanelScreenTab {
  readonly kind: 'screen'
  readonly id: string
  readonly labelKey: string
  readonly icon: string
  readonly screenId: ScreenId // The target screen to render inline
  readonly contextBinding: string // Field on the selected row that provides the target's ID
}

export type SidePanelTabContract = SidePanelLocalTab | SidePanelScreenTab

export interface SidePanelContract {
  readonly tabs: readonly SidePanelTabContract[]
  readonly defaultTabId?: string
  readonly defaultCollapsed?: boolean
}

// ── Working Area ─────────────────────────────────────────────────────────

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

// ── Unified Layout ───────────────────────────────────────────────────────

/**
 * The unified Layout Contract emitted by a ScreenDefinition.
 */
export interface ScreenLayoutContract {
  readonly workingArea: WorkingAreaContract
  readonly sidePanel?: SidePanelContract // Optional: only if the screen uses a side panel
}
