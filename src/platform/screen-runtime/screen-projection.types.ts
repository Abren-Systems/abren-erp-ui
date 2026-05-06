import type { ScreenCommand } from '../commands/command.types'

/**
 * ScreenProjection
 *
 * The deterministic derived UI model for the screen.
 * It is produced by a pure function mapping the Controller's state + metadata -> UI Projection.
 * It strictly owns "what is visible and its hierarchy", but NOT "how it is laid out visually".
 */
export interface ScreenProjection {
  readonly commands: {
    /** The single highest-priority workflow action (if any) */
    readonly expectedNext?: ScreenCommand

    /** High-priority commands intended for immediate visibility (e.g., toolbar favorites) */
    readonly primary: readonly ScreenCommand[]

    /** Lower-priority commands intended for overflow (e.g., more menu) */
    readonly secondary: readonly ScreenCommand[]
  }
}
