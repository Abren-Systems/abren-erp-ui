import type { ScreenDefinition } from '@/platform/screen-runtime'
import type { ModuleId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'

import type { ScreenId } from '@/platform/screen-runtime'

// ── AP Screen Definitions ─────────────────────────────────
// Each screen is a formal registry entry. Routes, menus, permissions,
// and test IDs are derived from these definitions — not from routes.ts.

// Screen definitions are lazily populated in per-aggregate screen files.
// This file re-exports them as the module's public screen surface.

import { AP3010PL } from './ui/AP3010PL/screen'
import { AP301000 } from './ui/AP301000/screen'
import { AP3020PL } from './ui/AP3020PL/screen'
import { AP302000 } from './ui/AP302000/screen'

export { AP3010PL, AP301000, AP3020PL, AP302000 }

/** All screens registered by the AP module */
export const apScreens: readonly ScreenDefinition[] = [AP3010PL, AP301000, AP3020PL, AP302000]

// Screens will be pushed into this array as they are defined.
// For now this is a placeholder — the actual wiring happens in Phase 2
// when the ScreenRegistry consumes module exports.

/** AP module identifier */
export const AP_MODULE_ID = toId<ModuleId>('ap')

/** Helper to create AP screen IDs with type safety */
export function apScreenId(id: string): ScreenId {
  return toId<ScreenId>(id)
}
