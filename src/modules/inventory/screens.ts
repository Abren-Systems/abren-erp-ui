import type { ScreenDefinition } from '@/platform/screen-runtime'

// Re-export foundation layer for public API consumers
export { INVENTORY_MODULE_ID } from './constants'

import { IN2040PL } from './ui/IN2040PL/screen'
import { IN204000 } from './ui/IN204000/screen'
import { IN2025PL } from './ui/IN2025PL/screen'
import { IN202500 } from './ui/IN202500/screen'
import { IN3030PL } from './ui/IN3030PL/screen'
import { IN303000 } from './ui/IN303000/screen'

export { IN2040PL, IN204000, IN2025PL, IN202500, IN3030PL, IN303000 }

/** All screens registered by the Inventory module */
export const inventoryScreens: readonly ScreenDefinition[] = [
  IN2040PL,
  IN204000,
  IN2025PL,
  IN202500,
  IN3030PL,
  IN303000,
]
