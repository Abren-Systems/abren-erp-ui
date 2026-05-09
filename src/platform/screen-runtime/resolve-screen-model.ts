import type { ScreenCommand } from '../commands/command.types'
import { isCommandVisible, getExpectedNextAction } from '../commands/command.types'
import type {
  ScreenStatePolicy,
  FieldStateOverride,
  SectionStateOverride,
} from './screen-state-policy.types'
import type { ScreenProjection, CommandProjection } from './screen-projection.types'

/**
 * resolveScreenProjection
 *
 * The single pure function that produces the entire deterministic rendering
 * contract for a screen. Composes domain constraint interpretation and
 * UI presentation derivation into one serializable ScreenProjection.
 *
 * Rules:
 * - No Vue reactivity (no refs, no computed, no watchers)
 * - No side effects
 * - 100% JSON-serializable output (zero functions)
 * - Fully testable via snapshot assertions
 */
export function resolveScreenProjection<TState extends string, TFieldKey extends string>(input: {
  screenId: string
  commands: readonly ScreenCommand[]
  domainState: TState
  availableActions: readonly string[]
  statePolicy: ScreenStatePolicy<TState, TFieldKey>
  services?: {
    hasNotes: boolean
    fileCount: number
    hasActivities: boolean
  }
  projectionId?: string
  timestamp?: number
  grids?: Record<string, unknown>
}): ScreenProjection {
  const { screenId, commands, domainState, availableActions, statePolicy } = input

  // ── 1. Domain Constraints (backend-derived truth) ──
  const behavior = statePolicy.states[domainState]
  const canEdit = behavior?.editable ?? false
  const canDelete = behavior?.deletable ?? false

  // ── 1.5 Record Services (API boundary) ──
  const { hasNotes = false, fileCount = 0, hasActivities = false } = input.services ?? {}

  // ── 2. UI: Chrome ──
  const banner = behavior?.banner
  const actionRequiredLabel = behavior?.actionRequiredLabel

  // ── 3. UI: Actions (command projection) ──
  const expectedNextCmd = getExpectedNextAction(commands, domainState, availableActions)

  const primaryActions: CommandProjection[] = []
  const secondaryActions: CommandProjection[] = []

  for (const cmd of commands) {
    const visible = isCommandVisible(cmd, domainState, availableActions)
    const enabled = visible
    const projection: CommandProjection = { command: cmd, visible, enabled }

    if (!visible) continue

    // Exclude expectedNext from primary/secondary to avoid duplication
    if (expectedNextCmd && cmd.key === expectedNextCmd.key) continue

    if (cmd.displayOnMainToolbar) {
      primaryActions.push(projection)
    } else {
      secondaryActions.push(projection)
    }
  }

  const expectedNext: CommandProjection | undefined = expectedNextCmd
    ? { command: expectedNextCmd, visible: true, enabled: true }
    : undefined

  // ── 4. UI: Layout (section overrides) ──
  const sections: Record<string, SectionStateOverride> = {}
  if (behavior?.sections) {
    for (const [key, override] of Object.entries(behavior.sections)) {
      if (override) {
        sections[key] = override
      }
    }
  }

  // ── 5. UI: Fields (field overrides) ──
  const fieldOverrides: Record<string, FieldStateOverride> = {}
  if (behavior?.fields) {
    for (const [key, override] of Object.entries(behavior.fields)) {
      if (override) {
        fieldOverrides[key] = override
      }
    }
  }

  return {
    version: 1,
    meta: {
      screenId,
      projectionId: input.projectionId ?? 'deterministic-id',
      timestamp: input.timestamp ?? 0,
    },
    domain: {
      backend: {
        availableActions,
        status: domainState,
      },
      capabilities: {
        canEdit,
        canDelete,
      },
      services: {
        hasNotes,
        fileCount,
        hasActivities,
      },
    },
    ui: {
      chrome: {
        banner,
        actionRequiredLabel,
      },
      actions: {
        expectedNext,
        primary: primaryActions,
        secondary: secondaryActions,
      },
      layout: {
        sections,
      },
      fields: {
        overrides: fieldOverrides,
      },
      grids: {
        state: input.grids ?? {},
      },
    },
  }
}
