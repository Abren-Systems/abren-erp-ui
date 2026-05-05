import type { ScreenDefinition, ScreenId } from '@/platform/screen-runtime'
import { toId } from '@/shared/types/brand.types'
import type { ModuleId } from '@/shared/types/brand.types'

import { TX2010PL } from './ui/TX2010PL/screen'
import { TX201000 } from './ui/TX201000/screen'
import { TX2020PL } from './ui/TX2020PL/screen'
import { TX202000 } from './ui/TX202000/screen'

export { TX2010PL, TX201000, TX2020PL, TX202000 }

/** All screens registered by the Tax module */
export const taxScreens: readonly ScreenDefinition[] = [TX2010PL, TX201000, TX2020PL, TX202000]

/** Tax module identifier */
export const TAX_MODULE_ID = toId<ModuleId>('tax')

/** Helper to create Tax screen IDs with type safety */
export function taxScreenId(id: string): ScreenId {
  return toId<ScreenId>(id)
}
