import type { RouteRecordRaw } from 'vue-router'
import type { ScreenDefinition } from './screen-definition.types'

/**
 * Generates a Vue Router route from a ScreenDefinition.
 *
 * The generated route uses the ScreenRenderer component,
 * which takes full ownership of chrome and controller lifecycle.
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
    component: () => import('./ScreenRenderer.vue'),
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
