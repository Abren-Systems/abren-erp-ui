import type { ModuleId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import type { ScreenId } from '@/platform/screen-runtime'

/** GL module identifier */
export const GL_MODULE_ID = toId<ModuleId>('ledger')

/** Helper to create GL screen IDs with type safety */
export function glScreenId(id: string): ScreenId {
  return toId<ScreenId>(id)
}
