// ── State Policy Interpreter ──────────────────────────────
// Single interpreter for ScreenStatePolicy.
// All consumers (useScreenController, useField, FormToolbar, list controllers)
// read from InterpretedState — never from raw policy.
//
// Principle: Policy defines truth. Interpreter enforces consistency.

import type { ScreenStatePolicy, BannerPolicy } from './screen-state-policy.types'

/**
 * The interpreted result of a ScreenStatePolicy for the current domain state.
 * Every consumer reads from this — no one interprets raw policy independently.
 */
export interface InterpretedState {
  /** Whether the record is editable in the current domain state */
  readonly editable: boolean

  /** Optional banner to render */
  readonly banner: BannerPolicy | undefined

  /** Whether a specific section is hidden */
  isSectionHidden(sectionKey: string): boolean

  /** Whether a specific section is disabled */
  isSectionDisabled(sectionKey: string): boolean

  /** Whether a specific field is readonly in the current state */
  isFieldReadonly(fieldKey: string): boolean

  /** Whether a specific field is required in the current state */
  isFieldRequired(fieldKey: string): boolean

  /** Whether a specific field is hidden in the current state */
  isFieldHidden(fieldKey: string): boolean

  /** The "Action Required" label for list screens (e.g., "Submit for Approval") */
  readonly actionRequiredLabel: string | undefined
}

/**
 * Interprets a ScreenStatePolicy for the given domain state.
 * Pure function — no side effects, no reactivity, fully testable.
 */
export function interpretStatePolicy<TState extends string, TFieldKey extends string>(
  policy: ScreenStatePolicy<TState, TFieldKey>,
  currentState: TState,
): InterpretedState {
  const behavior = policy.states[currentState]
  const editable = behavior?.editable ?? false

  return {
    editable,
    banner: behavior?.banner,
    isSectionHidden: (key: string) => behavior?.sections?.[key]?.hidden ?? false,
    isSectionDisabled: (key: string) => behavior?.sections?.[key]?.disabled ?? !editable,
    isFieldReadonly: (key: string) => behavior?.fields?.[key as TFieldKey]?.readonly ?? !editable,
    isFieldRequired: (key: string) => behavior?.fields?.[key as TFieldKey]?.required ?? false,
    isFieldHidden: (key: string) => behavior?.fields?.[key as TFieldKey]?.hidden ?? false,
    actionRequiredLabel: behavior?.actionRequiredLabel,
  }
}
