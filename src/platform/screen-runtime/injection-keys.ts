import type { InjectionKey, ShallowRef } from 'vue'
import type { ScreenController } from './screen-controller.types'

/**
 * Injection Key for the active ScreenController.
 * We inject the ShallowRef so that consumers remain reactive to navigation changes,
 * avoiding stale references if components are kept alive.
 */
export const ScreenControllerKey = Symbol('ScreenController') as InjectionKey<
  ShallowRef<ScreenController<unknown, string> | null>
>
