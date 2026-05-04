import type { ScreenId } from '../screen-runtime/screen-id.types'

// ── Global Navigation Hierarchy ──────────────────────────────────────
// These contracts define the static shape of the Acumatica-style left menu
// and the workspace dashboards. The actual instances of these menus are
// assembled at runtime by filtering against RBAC permissions.

/**
 * A discrete navigation link to a Screen or external URL.
 */
export interface NavigationLinkContract {
  readonly id: string
  readonly labelKey: string // i18n key
  readonly screenId?: ScreenId // If this link opens an ERP Screen
  readonly externalUrl?: string // If this link opens an external resource
  readonly requiredPermissions: readonly string[] // RBAC keys needed to view this link
}

/**
 * A Tile is a prominent, actionable square on a Workspace dashboard,
 * usually for quick actions like 'New Sales Order'.
 */
export interface WorkspaceTileContract {
  readonly id: string
  readonly labelKey: string
  readonly icon: string // Lucide icon name
  readonly link: NavigationLinkContract
  readonly highlightVariant?: 'primary' | 'success' | 'warning' | 'danger'
}

/**
 * A Category groups navigation links within a Workspace.
 * e.g., 'Transactions', 'Profiles', 'Inquiries'.
 */
export interface WorkspaceCategoryContract {
  readonly id: string
  readonly labelKey: string
  readonly links: readonly NavigationLinkContract[]
}

/**
 * A Workspace represents a functional area dashboard (e.g., 'Payables', 'Finance').
 * It is accessed via the Main Menu.
 */
export interface WorkspaceContract {
  readonly id: string
  readonly titleKey: string
  readonly icon: string
  readonly tiles: readonly WorkspaceTileContract[]
  readonly categories: readonly WorkspaceCategoryContract[]
  readonly requiredPermissions: readonly string[] // At least one permission required to see workspace
}

/**
 * The Main Menu is the persistent left sidebar.
 */
export interface MainMenuContract {
  readonly workspaces: readonly WorkspaceContract[]
  // Note: 'Favorites' and 'More Items' are structural behaviors handled by the App Shell,
  // but the Workspaces list is what populates the menu.
}
