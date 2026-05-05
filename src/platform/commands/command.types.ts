import type { Component } from 'vue'
import type { ScreenStateMachine } from '../screen-runtime/state-machine.types'
import type { ScreenData, ScreenController } from '../screen-runtime/screen-controller.types'

// ── Command Effects ───────────────────────────────────────
// Isolates side effects (API calls, navigation, notifications) from
// state mutation logic. Commands execute through this interface.

export interface CommandEffects {
  /** Executes a side effect asynchronously */
  run<T>(effectFn: () => Promise<T>): Promise<T>

  /** Notifies the user of a successful action */
  notifySuccess(message: string): void

  /** Notifies the user of a failed action */
  notifyError(message: string, error?: unknown): void
}

// ── Screen Command ────────────────────────────────────────
// A formal action a user can take on a screen.
// Commands govern their own visibility, enablement, category,
// and expected-next-action highlighting — matching Acumatica's
// More menu, toolbar, and command favorites model.

export interface ScreenCommand<TData = unknown> {
  /** Unique identifier (e.g., 'save', 'release', 'void') */
  readonly id: string

  /** Localization key for the display label */
  readonly labelKey: string

  /** Optional icon component */
  readonly icon?: Component

  /** Visual significance */
  readonly variant: 'primary' | 'neutral' | 'danger'

  // ── Acumatica-style command metadata ──

  /** Category key for More menu grouping */
  readonly categoryKey?: string

  /**
   * Whether this command should be highlighted as the likely next action.
   * Maps to Acumatica's expected-next-action toolbar highlighting.
   */
  readonly expectedNext?: boolean

  /**
   * Whether users can star this command to promote it to the toolbar.
   * Maps to Acumatica's command favorites.
   */
  readonly favoriteEligible?: boolean

  /** Whether executing this command requires a confirmation dialog */
  readonly requiresConfirmation?: boolean

  // ── Workflow Transitions ──

  /** The list of Domain States in which this command is allowed to be executed. If undefined, allowed in any state. */
  readonly from?: string[] // using string instead of DomainState to allow module-specific extension

  /** The Domain State this command transitions the record into upon successful execution. */
  readonly to?: string

  // ── Predicates ──

  /** Whether the command button should be rendered at all */
  isVisible(state: ScreenStateMachine): boolean

  /**
   * Whether the command button should be interactive vs disabled.
   * Disabled-but-visible matches Acumatica's convention for unavailable commands.
   */
  isEnabled(state: ScreenStateMachine, data: ScreenData<TData>): boolean

  /** The core execution logic — receives the controller and effects interface */
  execute(controller: ScreenController<TData>, effects: CommandEffects): Promise<void>
}
