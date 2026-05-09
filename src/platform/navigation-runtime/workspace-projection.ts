import type { WorkspaceId } from './workspace-definition'

export interface WorkspaceTileProjection {
  id: string
  labelKey: string
  icon: string
  screenId: string
}

export interface WorkspaceLinkProjection {
  id: string
  labelKey: string
  screenId: string
}

export interface WorkspaceCategoryProjection {
  id: string
  labelKey: string
  links: WorkspaceLinkProjection[]
}

/**
 * Pure serializable projection of the Workspace View (State A).
 * Equivalent to ScreenProjection. No functions, no Vue refs.
 */
export interface WorkspaceProjection {
  id: WorkspaceId
  titleKey: string
  icon: string

  tiles: WorkspaceTileProjection[]
  categories: WorkspaceCategoryProjection[]

  /** Evaluated navigation capabilities specific to this workspace */
  capabilities: Record<string, boolean>
}
