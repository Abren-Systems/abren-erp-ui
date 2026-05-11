import type { ScreenDefinition } from '@/platform/screen-runtime'

// Re-export foundation layer for public API consumers
export { TAX_MODULE_ID, taxScreenId } from './constants'

import { TX2055PL } from './ui/TX2055PL/screen'
import { TX205500 } from './ui/TX205500/screen'
import { TX2050PL } from './ui/TX2050PL/screen'
import { TX205000 } from './ui/TX205000/screen'

export { TX2055PL, TX205500, TX2050PL, TX205000 }

/** All screens registered by the Tax module */
export const taxScreens: readonly ScreenDefinition[] = [TX2055PL, TX205500, TX2050PL, TX205000]
