import type { ScreenStateMachine } from '../screen-runtime/state-machine.types'

/**
 * Field Render Archetypes.
 * Determines how the field is presented in the UI (e.g., text box, combobox, date picker).
 */
export type FieldRenderType =
  | 'text'
  | 'number'
  | 'amount'
  | 'date'
  | 'selector'
  | 'checkbox'
  | 'textarea'

/**
 * FieldDefinition
 *
 * The Acumatica-style rich definition for a domain field.
 * This moves validation and state rules out of the view template and into a formal contract
 * that the Controller evaluates.
 */
export interface FieldDefinition<TEntity = unknown, TValue = unknown> {
  /** The domain key of this field (e.g., 'amount', 'beneficiaryId') */
  readonly key: keyof TEntity

  /** Localization key or raw string for the UI label */
  readonly label: string

  /** The visual archetype for rendering */
  readonly type: FieldRenderType

  /**
   * Evaluates if this field should be read-only based on the current state machine.
   * If true, the Binding API will lock the field in the UI.
   */
  readonly readonly?: (state: ScreenStateMachine, entity: Partial<TEntity>) => boolean

  /**
   * Evaluates if this field is required for the current state.
   */
  readonly required?: (state: ScreenStateMachine, entity: Partial<TEntity>) => boolean

  /**
   * Validates the field value, returning an error message key if invalid.
   */
  readonly validate?: (
    value: TValue,
    state: ScreenStateMachine,
    entity: Partial<TEntity>,
  ) => string | null
}
