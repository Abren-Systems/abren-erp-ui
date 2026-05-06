import type { ModuleId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import type { ScreenId } from '@/platform/screen-runtime'

/** Tax module identifier */
export const TAX_MODULE_ID = toId<ModuleId>('tax')

/** Helper to create Tax screen IDs with type safety */
export function taxScreenId(id: string): ScreenId {
  return toId<ScreenId>(id)
}
