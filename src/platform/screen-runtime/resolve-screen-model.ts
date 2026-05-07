import type { ScreenCommand } from '../commands/command.types'
import { isCommandVisible, getExpectedNextAction } from '../commands/command.types'
import type {
  ScreenStatePolicy,
  FieldStateOverride,
  SectionStateOverride,
} from './screen-state-policy.types'
import type { ScreenModel, CommandProjection } from './screen-model.types'

/**
 * resolveScreenModel
 *
 * The single pure function that produces the entire deterministic rendering
 * contract for a screen. Composes domain constraint interpretation and
 * UI presentation derivation into one serializable ScreenModel.
 *
 * Rules:
 * - No Vue reactivity (no refs, no computed, no watchers)
 * - No side effects
 * - 100% JSON-serializable output (zero functions)
 * - Fully testable via snapshot assertions
 */
export function resolveScreenModel<TState extends string, TFieldKey extends string>(input: {
  screenId: string
  commands: readonly ScreenCommand[]
  domainState: TState
  availableActions: readonly string[]
  statePolicy: ScreenStatePolicy<TState, TFieldKey>
}): ScreenModel {
  const { screenId, commands, domainState, availableActions, statePolicy } = input

  // ── 1. Domain Constraints (backend-derived truth) ──
  const behavior = statePolicy.states[domainState]
  const canEdit = behavior?.editable ?? false

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
      projectionId: crypto.randomUUID(),
      timestamp: Date.now(),
    },
    domain: {
      backend: {
        availableActions,
        status: domainState,
      },
      capabilities: {
        canEdit,
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
    },
  }
}
