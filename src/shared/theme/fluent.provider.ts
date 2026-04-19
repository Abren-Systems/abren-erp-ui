import {
  provideFluentDesignSystem,
  fluentButton,
  fluentTextField,
  fluentSelect,
  fluentOption,
  fluentDialog,
  fluentProgressRing,
} from '@fluentui/web-components'

/**
 * Initializes the Microsoft Fluent UI Design System
 *
 * Registers the necessary standard web components defined by Microsoft FAST
 * to the browser's custom elements registry.
 */
export const initializeFluentUI = () => {
  provideFluentDesignSystem().register(
    fluentButton(),
    fluentTextField(),
    fluentSelect(),
    fluentOption(),
    fluentDialog(),
    fluentProgressRing(),
  )
}
