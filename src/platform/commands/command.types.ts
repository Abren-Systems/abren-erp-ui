// ── Screen Command ────────────────────────────────────────
// A formal declarative action a user can take on a screen.
//
// This is a DATA OBJECT — no methods. Visibility and enablement
// are derived by the platform toolbar from `from[]` + current
// domain state. Execution is dispatched through the controller's
// command registry (registerCommand).
//
// Maps to Acumatica's two-layer model:
//   Layer 1: Declaration (this object)
//   Layer 2: Platform resolver (FormToolbar reads these + controller executors)

export interface ScreenCommand {
  /** Unique identifier for the command (e.g., 'submit', 'release', 'void') */
  readonly key: string

  /** Localization key for the display label (e.g., 'ap.AP301000.actions.submit') */
  readonly labelKey: string

  /** Optional icon name from the icon library */
  readonly icon?: string

  /** Visual significance of the command */
  readonly variant: 'primary' | 'neutral' | 'danger'

  /**
   * Classification of the command for platform resolution.
   * - workflow: Visibility strictly governed by backend available_actions
   * - local: Purely frontend UI transition (e.g. wizard step)
   * - navigation: Redirects to another screen
   * - utility: Actions like print, export, etc.
   */
  readonly kind?: 'workflow' | 'local' | 'navigation' | 'utility'

  // ── Acumatica-style Toolbar / More Menu Placement ──

  /** Category key for More Menu grouping (e.g., 'processing', 'activities', 'other') */
  readonly categoryKey?: string

  /** Whether this command should also appear as a button on the main toolbar */
  readonly displayOnMainToolbar?: boolean

  /** Whether users can star this command to promote it to the toolbar */
  readonly favoriteEligible?: boolean

  // ── Workflow Transitions ──

  /**
   * The list of Domain States in which this command is visible and actionable.
   * If undefined, the command is visible in all states.
   */
  readonly from?: readonly string[]

  /** The Domain State this command transitions the record into upon success */
  readonly to?: string

  // ── Confirmation ──

  /** Whether executing this command requires a confirmation dialog */
  readonly requiresConfirmation?: boolean

  /** Localization key for the confirmation dialog message */
  readonly confirmationMessageKey?: string
}

// ── Command Resolution Utilities ──────────────────────────

/**
 * Determines whether a command is visible given the current domain state.
 * A command with no `from` constraint is always visible.
 */
export function isCommandVisible(
  command: ScreenCommand,
  domainState: string,
  availableActions?: readonly string[],
): boolean {
  if (command.kind === 'workflow' && availableActions) {
    return availableActions.includes(command.key)
  }

  if (!command.from || command.from.length === 0) return true
  return command.from.includes(domainState)
}

/**
 * Identifies the expected next action — the single primary command
 * that matches the current domain state.
 */
export function getExpectedNextAction(
  commands: readonly ScreenCommand[],
  domainState: string,
  availableActions?: readonly string[],
): ScreenCommand | undefined {
  return commands.find((cmd) => {
    if (cmd.variant !== 'primary') return false

    // If it's a workflow command and we have backend actions, it MUST be available
    if (cmd.kind === 'workflow' && availableActions) {
      return availableActions.includes(cmd.key)
    }

    // Fallback for non-workflow or if no availableActions provided
    return cmd.from !== undefined && cmd.from.includes(domainState)
  })
}

/**
 * Groups visible commands by their categoryKey for More Menu rendering.
 * Commands without a categoryKey are grouped under 'other'.
 */
export function groupCommandsByCategory(
  commands: readonly ScreenCommand[],
  _domainState: string,
  _availableActions?: readonly string[],
): Map<string, ScreenCommand[]> {
  const groups = new Map<string, ScreenCommand[]>()

  for (const cmd of commands) {
    const category = cmd.categoryKey ?? 'other'
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(cmd)
  }

  return groups
}
