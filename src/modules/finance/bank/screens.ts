import type { ScreenDefinition, ScreenId } from '@/platform/screen-runtime'
import { toId } from '@/shared/types/brand.types'
import type { ModuleId } from '@/shared/types/brand.types'

import { CA2020PL } from './ui/CA2020PL/screen'
import { CA202000 } from './ui/CA202000/screen'

export { CA2020PL, CA202000 }

/** All screens registered by the Bank module */
export const bankScreens: readonly ScreenDefinition[] = [CA2020PL, CA202000]

/** Bank module identifier */
export const BANK_MODULE_ID = toId<ModuleId>('bank')
