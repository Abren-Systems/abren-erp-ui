import type { ModuleId } from '@/shared/types/brand.types'
import { toId } from '@/shared/types/brand.types'
import type { ScreenId } from '@/platform/screen-runtime'

/** Workflows module identifier */
export const WORKFLOWS_MODULE_ID = toId<ModuleId>('workflows')

/** Helper to create Workflows screen IDs with type safety */
export function workflowsScreenId(id: string): ScreenId {
  return toId<ScreenId>(id)
}
