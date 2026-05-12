import type { WorkspaceContract } from '@/platform/navigation/navigation.contract'
import type {
  WorkspaceDefinition,
  WorkspaceRuntimeContext,
  WorkspaceTileDefinition,
} from './workspace-definition'
import type {
  WorkspaceProjection,
  WorkspaceTileProjection,
  WorkspaceCategoryProjection,
} from './workspace-projection'

/**
 * NAI-04: Workspace projection resolution must be synchronous and deterministic.
 * Pure projection function.
 */
export function resolveWorkspaceProjection(
  definition: WorkspaceDefinition | WorkspaceContract,
  context: WorkspaceRuntimeContext,
): WorkspaceProjection {
  // `WorkspaceContract` tiles use a nested `link` shape when non-empty; all modules
  // currently pass `tiles: []`. Cast keeps resolver compatible with both contracts.
  const tilesIn = definition.tiles as unknown as readonly WorkspaceTileDefinition[]

  // Filter tiles based on visibility rules
  const tiles: WorkspaceTileProjection[] = tilesIn
    .filter((t) => isTileVisible(t, context))
    .map((t) => ({
      id: t.id,
      labelKey: t.labelKey,
      icon: t.icon,
      screenId: t.screenId,
      routeName: t.routeName,
    }))
    .filter((t) => t.screenId || t.routeName)

  // Filter categories and their links
  const categories: WorkspaceCategoryProjection[] = []

  for (const cat of definition.categories) {
    if (!isCategoryVisible(cat, context)) continue

    const links = cat.links
      .filter((l) => isLinkVisible(l, context))
      .map((l) => ({
        id: l.id,
        labelKey: l.labelKey,
        screenId: l.screenId,
        routeName: l.routeName,
      }))
      .filter((l) => l.screenId || l.routeName)

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
    id: definition.id as WorkspaceProjection['id'],
    titleKey: definition.titleKey,
    icon: definition.icon,
    tiles,
    categories,
    capabilities,
  }
}

function isTileVisible(tile: unknown, context: WorkspaceRuntimeContext): boolean {
  const t = tile as { isVisible?: (ctx: WorkspaceRuntimeContext) => boolean }
  if (!t.isVisible) return true
  return t.isVisible(context)
}

function isCategoryVisible(category: unknown, context: WorkspaceRuntimeContext): boolean {
  const c = category as { isVisible?: (ctx: WorkspaceRuntimeContext) => boolean }
  if (!c.isVisible) return true
  return c.isVisible(context)
}

function isLinkVisible(link: unknown, context: WorkspaceRuntimeContext): boolean {
  const l = link as { isVisible?: (ctx: WorkspaceRuntimeContext) => boolean }
  if (!l.isVisible) return true
  return l.isVisible(context)
}
