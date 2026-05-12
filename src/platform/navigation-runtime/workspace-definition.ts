export type WorkspaceId = string & { readonly __workspaceId: unique symbol }

export function createWorkspaceId(id: string): WorkspaceId {
  return id as WorkspaceId
}

export interface WorkspaceRuntimeContext {
  /** Current active tenant ID */
  tenantId: string
  /** Current active user ID */
  userId: string
  /** Active roles for the user in the current tenant */
  roles: string[]
  /** Active feature flags */
  features: Record<string, boolean>
  /** Current localization/language */
  locale: string
  /** Environment type (production, sandbox, etc.) */
  environment: string
  /** Evaluated navigation capabilities for the current user */
  capabilities: Record<string, boolean>
}

export interface WorkspaceTileDefinition {
  id: string
  labelKey: string
  icon: string
  /** Set when navigating via `screenRegistry` */
  screenId?: string
  /** Vue Router route name when the destination is not a registered screen */
  routeName?: string
  /**
   * Evaluator for tile visibility based purely on context.
   * MUST be synchronous.
   */
  isVisible?: (context: WorkspaceRuntimeContext) => boolean
}

export interface WorkspaceLinkDefinition {
  id: string
  labelKey: string
  screenId?: string
  routeName?: string
  isVisible?: (context: WorkspaceRuntimeContext) => boolean
}

export interface WorkspaceCategoryDefinition {
  id: string
  labelKey: string
  links: WorkspaceLinkDefinition[]
  isVisible?: (context: WorkspaceRuntimeContext) => boolean
}

/**
 * Static declarative contract for a Workspace (State A navigation).
 * Equivalent to ScreenDefinition.
 */
export interface WorkspaceDefinition {
  id: WorkspaceId
  titleKey: string
  icon: string

  tiles: WorkspaceTileDefinition[]
  categories: WorkspaceCategoryDefinition[]

  /**
   * Global capabilities required for this workspace.
   */
  requiredCapabilities?: string[]
}
