import type { ScreenCommand } from '@/platform/commands/command.types'

/**
 * TX201000 Command Registry
 *
 * Maintenance screens typically use standard platform actions (Save/Cancel).
 * Custom actions (e.g., "Deactivate", "Recalculate") would be declared here.
 */
export const TX201000_COMMANDS: Record<string, ScreenCommand> = {}
