import type { ScreenStateMachine } from './state-machine.types'
import type { ScreenData } from './controller.types'
import type { ScreenController } from './controller.types'
import type { Component } from 'vue'

/**
 * An isolated execution context for Commands.
 * This ensures that side effects (like API calls or navigation)
 * are formally decoupled from state mutation logic.
 */
export interface CommandEffects {
  /**
   * Executes a side effect asynchronously.
   * If the effect throws, the Command should handle the failure gracefully.
   */
  run<T>(effectFn: () => Promise<T>): Promise<T>

  /**
   * Notifies the user of a successful action.
   */
  notifySuccess(message: string): void

  /**
   * Notifies the user of a failed action.
   */
  notifyError(message: string, error?: unknown): void
}

/**
 * A formal Command that represents an action a user can take on a screen.
 * Commands govern their own visibility and enablement based on the Controller's state.
 */
export interface Command<TData = unknown> {
  /** Unique identifier for the command (e.g., 'save', 'release') */
  id: string

  /** Display label for the UI */
  label: string

  /** Optional icon component */
  icon?: Component

  /** Visual significance of the command */
  variant: 'primary' | 'neutral' | 'danger'

  /**
   * Predicate determining if the command button should be rendered in the UI at all.
   */
  isVisible(state: ScreenStateMachine): boolean

  /**
   * Predicate determining if the command button should be interactive vs disabled.
   * Receives both state and data (e.g., to check if lines exist).
   */
  isEnabled(state: ScreenStateMachine, data: ScreenData<TData>): boolean

  /**
   * The core execution logic of the command.
   * Receives the controller (for state mutation) and effects (for API calls).
   */
  execute(controller: ScreenController<TData>, effects: CommandEffects): Promise<void>
}
