import { shallowRef, type ShallowRef } from 'vue'
import type { ScreenController } from '../../screen-runtime/screen-controller.types'

/**
 * Global registry for the active screen controller.
 * Only used for DevTools introspection.
 */
export const activeController: ShallowRef<ScreenController<unknown, string> | null> =
  shallowRef(null)

export function registerActiveController(controller: ScreenController<unknown, string> | null) {
  activeController.value = controller
}
