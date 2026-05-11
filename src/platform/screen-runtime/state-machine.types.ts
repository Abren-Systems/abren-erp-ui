// ── Dual-Layered State Machine ────────────────────────────
// UI state tracks the interaction mode of the screen surface.
// Domain state tracks the business logic state of the aggregate.
// Both are governed by explicit transitions, never direct assignment.

/**
 * The interaction mode of the screen's UI surface.
 */
export type UIState =
  | 'INITIALIZING' // Screen is booting, fetching initial context
  | 'NEW' // A blank record that has never been saved
  | 'VIEW' // An existing record in read-only mode
  | 'EDIT' // An existing record with unsaved mutations
  | 'SAVING' // An active mutation is in flight
  | 'DEGRADED' // Operational metadata or concurrency state is unsafe; render read-only

/**
 * Base domain states shared across modules.
 * Each module extends this with its own state union via the generic parameter.
 */
export type BaseDomainState = 'DRAFT' | 'BALANCED' | 'HOLD' | 'RELEASED' | 'VOIDED'

/**
 * The formal state machine governing all screen interactions.
 * Generic over TDomain so each module can define its own domain state union.
 *
 * @example
 * // AP module defines:
 * type APDomainState = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'AUTHORIZED' | 'CANCELLED'
 * // Controller uses: ScreenStateMachine<APDomainState>
 */
export interface ScreenStateMachine<TDomain extends string = BaseDomainState> {
  readonly ui: UIState
  readonly domain: TDomain

  /**
   * Evaluates if the current combination of UI and Domain state
   * permits mutation of the underlying data fields.
   */
  readonly isEditable: boolean

  /**
   * Safely attempts to transition the UI state.
   * @throws Error if the transition is illegal (e.g., VIEW -> SAVING)
   */
  transitionUI(newState: UIState): void

  /**
   * Safely attempts to transition the Domain state.
   * Typically triggered by a successful backend Command effect.
   */
  transitionDomain(newState: TDomain): void
}
