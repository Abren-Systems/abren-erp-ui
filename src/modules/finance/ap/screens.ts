import type { ScreenDefinition } from '@/platform/screen-runtime'

// Re-export foundation layer for public API consumers
export { AP_MODULE_ID, apScreenId } from './constants'

// ── AP Screen Definitions ─────────────────────────────────
// Each screen is a formal registry entry. Routes, menus, permissions,
// and test IDs are derived from these definitions — not from routes.ts.

import { AP3010PL } from './ui/AP3010PL/screen'
import { AP301000 } from './ui/AP301000/screen'
import { AP3015PL } from './ui/AP3015PL/screen'
import { AP301500 } from './ui/AP301500/screen'

export { AP3010PL, AP301000, AP3015PL, AP301500 }

/** All screens registered by the AP module */
export const apScreens: readonly ScreenDefinition[] = [AP3010PL, AP301000, AP3015PL, AP301500]
