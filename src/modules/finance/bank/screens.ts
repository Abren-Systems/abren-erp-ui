import type { ScreenDefinition } from '@/platform/screen-runtime'

// Re-export foundation layer for public API consumers
export { BANK_MODULE_ID } from './constants'

import { CA2020PL } from './ui/CA2020PL/screen'
import { CA202000 } from './ui/CA202000/screen'

export { CA2020PL, CA202000 }

/** All screens registered by the Bank module */
export const bankScreens: readonly ScreenDefinition[] = [CA2020PL, CA202000]
