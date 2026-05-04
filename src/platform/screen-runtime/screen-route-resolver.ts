import type { RouteRecordRaw } from 'vue-router'
import type { ScreenDefinition } from './screen-definition.types'

/**
 * Generates a Vue Router route from a ScreenDefinition.
 *
 * During the migration period, screens declare a `renderTarget` — a lazy
 * component import pointing to their existing SFC page. The generated route
 * uses this as the component, preserving full backward compatibility.
 *
 * Once the ScreenRenderer is built (Phase 4), renderTarget becomes optional
 * and the route will point to a generic ScreenRenderer component instead.
 */
function screenToRoute(screen: ScreenDefinition): RouteRecordRaw {
  const route = screen.route

  return {
    path: route.path,
    name: route.name,
    meta: {
      screenId: screen.id as string,
      screenKind: screen.kind,
      title: screen.titleKey,
    },
    component: screen.layout.renderTarget
      ? (screen.layout.renderTarget as () => Promise<unknown>)
      : () => import('./ScreenPlaceholder.vue'),
    props: true,
  }
}

/**
 * Converts an array of ScreenDefinitions into Vue Router routes.
 *
 * This is the bridge between the screen-first world and the existing
 * Vue Router infrastructure. It allows registered screens to participate
 * in routing without requiring all modules to migrate simultaneously.
 */
export function resolveScreenRoutes(screens: readonly ScreenDefinition[]): RouteRecordRaw[] {
  return screens.map(screenToRoute)
}
