import { coreModule } from './core'
import { ledgerModule } from './finance/ledger'
import { bankModule } from './finance/bank'
import { apModule } from './finance/ap'
import { reportingModule } from './reporting'
import { workflowsModule } from './workflows'
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
  reportingModule,
] as unknown as BusinessDomain[]

export const platformModules: PlatformEngine[] = [coreModule, workflowsModule]

// All modules for convenience (e.g. router)
export const allModules = [...businessModules, ...platformModules]
