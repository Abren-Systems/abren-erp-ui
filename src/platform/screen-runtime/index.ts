/**
 * Screen Runtime
 *
 * The authoritative module for ERP screen metadata.
 * ScreenDefinition is the primary unit of the frontend — routes, menus,
 * permissions, test IDs, localization, and personalization are all
 * consumers of screen metadata.
 */

export type { ScreenId, ScreenInstanceId } from './screen-id.types'
export type { ScreenView, ScreenViews, ScreenViewKind } from './screen-view.types'
export type { UIState, DomainState, ScreenStateMachine } from './state-machine.types'
export type { ScreenData, ScreenController } from './screen-controller.types'
export type {
  ScreenControllerDataSource,
  ScreenControllerOptions,
  ControllerCommand,
  ScreenControllerInstance,
} from './useScreenController'
export { useScreenController } from './useScreenController'
export type {
  ScreenKind,
  LayoutTemplate,
  ScreenLayoutDefinition,
  ScreenRoute,
  ScreenPermission,
  ScreenTestContract,
  ScreenPersonalizationPolicy,
  ScreenDefinition,
} from './screen-definition.types'
export { ScreenRegistry, screenRegistry } from './screen-registry'
export { resolveScreenRoutes } from './screen-route-resolver'
