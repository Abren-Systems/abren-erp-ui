import type { Component } from 'vue'
import type { ScreenController } from './controller.types'
import type { ScreenInstance } from './workspace.types'

/**
 * Defines a formal Screen within the ERP.
 * This is the ultimate boundary definition that replaces standard SPA page components.
 * It provides the layout, the controller factory, and the specific commands.
 */
export interface ScreenDefinition<TData = unknown, TContext = unknown> {
  /**
   * The unique system identifier for this screen (e.g., 'AP301000').
   * Used for permissions, routing, and workspace identification.
   */
  readonly id: string

  /**
   * The layout component representing the UI shell of this screen.
   * This component should exclusively use `<ScreenLayout>` with
   * `#top-pane` and `#working-area` slots.
   */
  readonly layout: Component

  /**
   * Factory function that instantiates the ScreenController for a specific instance.
   * This is called by the Workspace when opening a new tab for this screen.
   */
  createController(instance: ScreenInstance<TContext>): ScreenController<TData>
}
