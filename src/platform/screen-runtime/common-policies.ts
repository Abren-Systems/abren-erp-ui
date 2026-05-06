// ── Common Screen State Policies ──────────────────────────
// Reusable policies for standard screen kinds that don't need
// per-screen state customization.

import type { ScreenStatePolicy } from './screen-state-policy.types'
import type { BaseDomainState } from './state-machine.types'

/**
 * Policy for list/inquiry screens (PL suffix).
 * These screens display collections — they have no editable record state.
 */
export const LIST_SCREEN_POLICY: ScreenStatePolicy<'VIEW'> = {
  states: {
    VIEW: {
      editable: false,
    },
  },
}

/**
 * Default getDomainState for list screens — always returns 'VIEW'.
 * List screens don't have a meaningful domain state since they show collections.
 */
export function listScreenDomainState(_entity: unknown): 'VIEW' {
  return 'VIEW'
}

/**
 * Policy for simple maintenance screens with standard lifecycle.
 * Editable in DRAFT and HOLD, read-only otherwise.
 */
export const MAINTENANCE_SCREEN_POLICY: ScreenStatePolicy<BaseDomainState> = {
  states: {
    DRAFT: { editable: true },
    HOLD: { editable: true },
    BALANCED: { editable: false },
    RELEASED: { editable: false },
    VOIDED: { editable: false },
  },
}

/**
 * Default getDomainState for entities with a `status` property.
 */
export function statusDomainState<T extends { status: string }>(entity: T): BaseDomainState {
  return entity.status.toUpperCase() as BaseDomainState
}
