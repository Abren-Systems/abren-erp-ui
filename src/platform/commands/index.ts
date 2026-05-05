/**
 * Command System
 *
 * Formal command definitions with Acumatica-style metadata:
 * categories, expected-next-action, favorites, and confirmation.
 */

export type { ScreenCommand } from './command.types'
export { isCommandVisible, getExpectedNextAction, groupCommandsByCategory } from './command.types'
