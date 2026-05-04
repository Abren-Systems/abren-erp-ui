// ── Action Contracts ───────────────────────────────────────────────────────
// Pure data definitions for buttons, toolbar items, and menu actions.
// These govern how `AppButton` and `ActionMenu` render.

export type ActionVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

/**
 * A discrete executable action.
 * Maps to a `ScreenCommand` in the metadata.
 */
export interface ActionContract {
  readonly key: string // Unique identifier for the command (e.g., 'Release')
  readonly labelKey: string
  readonly icon?: string
  readonly variant?: ActionVariant
  readonly requiresConfirmation?: boolean
  readonly confirmationMessageKey?: string
  readonly enabled?: boolean
  readonly description?: string
}
