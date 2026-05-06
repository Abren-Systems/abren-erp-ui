// ── Screen State Policy ───────────────────────────────────
// The per-screen declarative presentation contract.
//
// This is NOT a state machine — it does not define transitions.
// Transitions are owned by the backend WorkflowBlueprint / IStateOrchestrator.
//
// This is the frontend equivalent of Acumatica's WithFieldStates() in
// the Workflow API — it declares how the UI renders in each domain state.

/**
 * ScreenStatePolicy — The Unified Presentation Contract
 *
 * Declares how a screen's UI behaves in each domain state.
 * One policy per screen. One source of truth for all field/editability behavior.
 *
 * @template TState - The module-specific domain state union
 * @template TFieldKey - The entity's field keys
 */
export interface ScreenStatePolicy<
  TState extends string = string,
  TFieldKey extends string = string,
> {
  /** Domain states this screen can encounter, with behavior for each */
  readonly states: Record<TState, StateBehavior<TFieldKey>>
}

export interface BannerPolicy {
  readonly messageKey: string
  readonly variant: 'info' | 'warning' | 'danger'
}

export interface SectionStateOverride {
  readonly hidden?: boolean
  readonly disabled?: boolean
}

/**
 * Declares UI behavior for a single domain state.
 */
export interface StateBehavior<TFieldKey extends string = string> {
  /** Is the record editable in this state? */
  readonly editable: boolean

  /** Optional banner to display at the top of the form in this state */
  readonly banner?: BannerPolicy

  /** Sections with state-dependent visibility or disablement */
  readonly sections?: Partial<Record<string, SectionStateOverride>>

  /** Fields with non-default behavior in this state */
  readonly fields?: Partial<Record<TFieldKey, FieldStateOverride>>

  /** Human-readable label for the "Action Required" column on list screens */
  readonly actionRequiredLabel?: string
}

/**
 * Per-field overrides within a specific domain state.
 * Omitted properties inherit from the state's `editable` flag.
 */
export interface FieldStateOverride {
  readonly readonly?: boolean
  readonly required?: boolean
  readonly hidden?: boolean
}
