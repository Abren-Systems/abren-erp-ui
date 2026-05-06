import type { ScreenCommand } from '../commands/command.types'
import { isCommandVisible, getExpectedNextAction } from '../commands/command.types'
import type { ScreenProjection } from './screen-projection.types'

/**
 * resolveScreenProjection
 *
 * A pure, stateless, deterministic function that maps the Controller's
 * available state into a structured UI Projection.
 *
 * It strictly avoids Vue reactivity (no refs, no computed) and has zero side effects.
 *
 * @param commands All possible commands declared by the screen definition
 * @param domainState The current domain state of the record
 * @param availableActions The backend-provided list of available workflow actions
 * @returns A ScreenProjection defining what commands are visible and their hierarchical importance
 */
export function resolveScreenProjection(
  commands: readonly ScreenCommand[],
  domainState: string,
  availableActions?: readonly string[],
): ScreenProjection {
  const expectedNext = getExpectedNextAction(commands, domainState, availableActions)

  const primary: ScreenCommand[] = []
  const secondary: ScreenCommand[] = []

  for (const cmd of commands) {
    if (!isCommandVisible(cmd, domainState, availableActions)) {
      continue
    }

    // Exclude expectedNext from primary/secondary lists to avoid duplication
    if (expectedNext && cmd.key === expectedNext.key) {
      continue
    }

    if (cmd.displayOnMainToolbar) {
      primary.push(cmd)
    } else {
      secondary.push(cmd)
    }
  }

  return {
    commands: {
      expectedNext,
      primary,
      secondary,
    },
  }
}
