import type { ModuleId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import type { ScreenId } from '@/platform/screen-runtime'

/** AP module identifier */
export const AP_MODULE_ID = toId<ModuleId>('ap')

/** Helper to create AP screen IDs with type safety */
export function apScreenId(id: string): ScreenId {
  return toId<ScreenId>(id)
}
