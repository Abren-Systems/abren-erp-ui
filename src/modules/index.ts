import { coreModule } from './core'
import { ledgerModule } from './finance/ledger'
import { bankModule } from './finance/bank'
import { apModule } from './finance/ap'
import { taxModule } from './finance/tax'
import { reportingModule } from './reporting'
import { workflowsModule } from './workflows'
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
  taxModule,
  reportingModule,
  inventoryModule,
]

export const platformModules: PlatformEngine[] = [coreModule, workflowsModule]

import { screenRegistry } from '@/platform/screen-runtime'

// All modules for convenience (e.g. router)
export const allModules = [...businessModules, ...platformModules]

// ── Screen Registry Initialization ──────────────────────────
// Register all screens provided by the modules into the global registry.
for (const module of allModules) {
  if (module.screens && module.screens.length > 0) {
    screenRegistry.registerAll(module.screens)
  }
}
