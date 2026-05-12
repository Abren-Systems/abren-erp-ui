import { coreModule } from './core'
import { ledgerModule } from './finance/ledger'
import { bankModule } from './finance/bank'
import { apModule } from './finance/ap'
import { taxModule } from './finance/tax'
import { arModule } from './finance/ar'
import { reportingModule } from './reporting'
import { systemModule } from './system'
import { inventoryModule } from './inventory'
import type { BusinessDomain, PlatformEngine } from '@/shared/types/module.types'

/**
 * Categorized Module Registry
 *
 * Separates "Business Domains" (User Apps) from "Platform Engines" (Internals).
 */
export const businessModules: BusinessDomain[] = [
  ledgerModule,
  bankModule,
  apModule,
  arModule,
  taxModule,
  reportingModule,
  inventoryModule,
]

export const platformModules: PlatformEngine[] = [coreModule, systemModule]

import { screenRegistry } from '@/platform/screen-runtime'
import { workspaceRegistry } from '@/platform/navigation-runtime/workspace-registry'

// Workspace Imports
import { ledgerWorkspace } from './finance/ledger/workspace'
import { bankWorkspace } from './finance/bank/workspace'
import { apWorkspace } from './finance/ap/workspace'
import { taxWorkspace } from './finance/tax/workspace'
import { arWorkspace } from './finance/ar/workspace'
import { reportingWorkspace } from './reporting/workspace'
import { inventoryWorkspace } from './inventory/workspace'
import { coreWorkspace } from './core/workspace'
import { workflowWorkspace } from './system/workspace'

// All modules for convenience (e.g. router)
export const allModules = [...businessModules, ...platformModules]

// ── Screen & Workspace Registry Initialization ──────────────────────────

// Register Screens
for (const module of allModules) {
  if (module.screens && module.screens.length > 0) {
    screenRegistry.registerAll(module.screens)
  }
}

// Register Workspaces
workspaceRegistry.register(ledgerWorkspace)
workspaceRegistry.register(bankWorkspace)
workspaceRegistry.register(apWorkspace)
workspaceRegistry.register(taxWorkspace)
workspaceRegistry.register(arWorkspace)
workspaceRegistry.register(reportingWorkspace)
workspaceRegistry.register(inventoryWorkspace)
workspaceRegistry.register(coreWorkspace)
workspaceRegistry.register(workflowWorkspace)
