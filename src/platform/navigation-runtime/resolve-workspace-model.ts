import type {
  WorkspaceDefinition,
  WorkspaceRuntimeContext,
  WorkspaceTileDefinition,
  WorkspaceCategoryDefinition,
  WorkspaceLinkDefinition,
} from './workspace-definition'
import type { WorkspaceModel, WorkspaceTileModel, WorkspaceCategoryModel } from './workspace-model'

/**
 * NAI-04: Workspace projection resolution must be synchronous and deterministic.
 * Pure projection function.
 */
export function resolveWorkspaceModel(
  definition: WorkspaceDefinition,
  context: WorkspaceRuntimeContext,
): WorkspaceModel {
  // Filter tiles based on visibility rules
  const tiles: WorkspaceTileModel[] = definition.tiles
    .filter((t) => isTileVisible(t, context))
    .map((t) => ({
      id: t.id,
      labelKey: t.labelKey,
      icon: t.icon,
      screenId: t.screenId,
    }))

  // Filter categories and their links
  const categories: WorkspaceCategoryModel[] = []

  for (const cat of definition.categories) {
    if (!isCategoryVisible(cat, context)) continue

    const links = cat.links
      .filter((l) => isLinkVisible(l, context))
      .map((l) => ({
        id: l.id,
        labelKey: l.labelKey,
        screenId: l.screenId,
      }))

    // Only include categories that have at least one visible link
    if (links.length > 0) {
      categories.push({
        id: cat.id,
        labelKey: cat.labelKey,
        links,
      })
    }
  }

  // Capabilities could be derived from context and required capabilities
  const capabilities: Record<string, boolean> = { ...context.capabilities }

  return {
    id: definition.id,
    titleKey: definition.titleKey,
    icon: definition.icon,
    tiles,
    categories,
    capabilities,
  }
}

function isTileVisible(tile: WorkspaceTileDefinition, context: WorkspaceRuntimeContext): boolean {
  if (!tile.isVisible) return true
  return tile.isVisible(context)
}

function isCategoryVisible(
  category: WorkspaceCategoryDefinition,
  context: WorkspaceRuntimeContext,
): boolean {
  if (!category.isVisible) return true
  return category.isVisible(context)
}

function isLinkVisible(link: WorkspaceLinkDefinition, context: WorkspaceRuntimeContext): boolean {
  if (!link.isVisible) return true
  return link.isVisible(context)
}
