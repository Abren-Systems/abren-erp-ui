/**
 * Abren ERP Platform
 *
 * The ERP operating layer. This is NOT a component library — it defines
 * the runtime contracts that make screens, commands, navigation,
 * personalization, and component contracts first-class platform services.
 *
 * Import from subdomains for clarity:
 *   import type { ScreenDefinition } from '@/platform/screen-runtime'
 *   import type { ScreenCommand } from '@/platform/commands'
 *   import type { Workspace } from '@/platform/navigation'
 */

export * from './screen-runtime'
export * from './commands'
export * from './navigation'
