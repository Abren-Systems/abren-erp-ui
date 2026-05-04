/**
 * Represents the fundamental interaction mode of the screen's UI surface.
 */
export type UIState =
  | 'INITIALIZING' // Screen is booting up, fetching initial context
  | 'NEW' // A blank record that has never been saved
  | 'VIEW' // An existing record in read-only mode
  | 'EDIT' // An existing record with unsaved mutations
  | 'SAVING' // An active mutation is in flight

/**
 * Represents the business logic state of the underlying aggregate.
 * Note: specific domains (e.g., AP) may extend or narrow these states.
 */
export type DomainState = 'DRAFT' | 'BALANCED' | 'HOLD' | 'RELEASED' | 'VOIDED'

/**
 * The formal state machine that governs all screen interactions.
 * Mutations to state MUST happen via explicit transitions, not direct assignment.
 */
export interface ScreenStateMachine {
  readonly ui: UIState
  readonly domain: DomainState

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
   * This is typically triggered by a successful backend Command effect.
   */
  transitionDomain(newState: DomainState): void
}
