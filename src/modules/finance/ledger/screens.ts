import type { ScreenDefinition } from '@/platform/screen-runtime'

// Re-export foundation layer for public API consumers
export { GL_MODULE_ID, glScreenId } from './constants'

// ── GL Screen Definitions ─────────────────────────────────
// Each screen is a formal registry entry. Routes, menus, permissions,
// and test IDs are derived from these definitions — not from routes.ts.

import { GL301000 } from './ui/GL301000/screen'
import { GL3010PL } from './ui/GL3010PL/screen'
import { GL201000 } from './ui/GL201000/screen'
import { GL101000 } from './ui/GL101000/screen'
import { GL102000 } from './ui/GL102000/screen'
import { GL202500 } from './ui/GL202500/screen'
import { GL2025PL } from './ui/GL2025PL/screen'
import { GL503000 } from './ui/GL503000/screen'

export { GL301000, GL3010PL, GL201000, GL101000, GL102000, GL202500, GL2025PL, GL503000 }

/** All screens registered by the Ledger module */
export const ledgerScreens: readonly ScreenDefinition[] = [
  GL301000,
  GL3010PL,
  GL201000,
  GL101000,
  GL102000,
  GL202500,
  GL2025PL,
  GL503000,
]
