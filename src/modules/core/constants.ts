import type { ModuleId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import type { ScreenId } from '@/platform/screen-runtime'

/** Core module identifier */
export const CORE_MODULE_ID = toId<ModuleId>('core')

/** Helper to create Core screen IDs with type safety */
export function coreScreenId(id: string): ScreenId {
  return toId<ScreenId>(id)
}
