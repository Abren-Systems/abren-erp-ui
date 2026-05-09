import type { WorkspaceId } from './workspace-definition'

export interface WorkspaceTileModel {
  id: string
  labelKey: string
  icon: string
  screenId: string
}

export interface WorkspaceLinkModel {
  id: string
  labelKey: string
  screenId: string
}

export interface WorkspaceCategoryModel {
  id: string
  labelKey: string
  links: WorkspaceLinkModel[]
}

/**
 * Pure serializable projection of the Workspace View (State A).
 * Equivalent to ScreenModel. No functions, no Vue refs.
 */
export interface WorkspaceModel {
  id: WorkspaceId
  titleKey: string
  icon: string

  tiles: WorkspaceTileModel[]
  categories: WorkspaceCategoryModel[]

  /** Evaluated navigation capabilities specific to this workspace */
  capabilities: Record<string, boolean>
}
