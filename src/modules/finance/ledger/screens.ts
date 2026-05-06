import type { ScreenDefinition } from '@/platform/screen-runtime'

// Re-export foundation layer for public API consumers
export { GL_MODULE_ID, glScreenId } from './constants'

// ── GL Screen Definitions ─────────────────────────────────
// Each screen is a formal registry entry. Routes, menus, permissions,
// and test IDs are derived from these definitions — not from routes.ts.

import { GL301000 } from './ui/GL301000/screen'
import { GL3010PL } from './ui/GL3010PL/screen'
import { GL201000 } from './ui/GL201000/screen'
import { GL2010PL } from './ui/GL2010PL/screen'

export { GL301000, GL3010PL, GL201000, GL2010PL }

/** All screens registered by the Ledger module */
export const ledgerScreens: readonly ScreenDefinition[] = [GL301000, GL3010PL, GL201000, GL2010PL]
