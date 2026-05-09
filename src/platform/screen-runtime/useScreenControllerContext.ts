import { inject, isRef } from 'vue'
import { ScreenControllerKey } from './injection-keys'

/**
 * Null-safe injection boundary for the active ScreenController.
 *
 * Views should use this instead of manual `inject(ScreenControllerKey)!.value!`
 * to ensure robust error boundaries and correct unwrapping of the internal ref.
 */
export function useScreenControllerContext<TController>() {
  const controllerRef = inject(ScreenControllerKey)

  if (!controllerRef) {
    throw new Error(
      '[ScreenRuntime] Controller not provided. The component must be rendered within a <ScreenRenderer>.',
    )
  }

  const controller = isRef(controllerRef) ? controllerRef.value : controllerRef

  if (!controller) {
    throw new Error(
      '[ScreenRuntime] Controller was provided but is null. The route may be transitioning.',
    )
  }

  return controller as TController
}
