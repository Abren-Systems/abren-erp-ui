import { computed, type ComputedRef } from 'vue'
import type { ScreenControllerInstance } from '@/platform/screen-runtime/useScreenController'

export interface GridBinding<TRow = unknown> {
  rows: ComputedRef<TRow[]>
  readonly: ComputedRef<boolean>
}

/**
 * useGrid Binding API
 *
 * Binds a grid to a subgraph key on the active ScreenController.
 * This guarantees that grids cannot fetch their own data or mutate it independently.
 */
export function useGrid<TEntity, K extends keyof TEntity>(
  controller: ScreenControllerInstance<TEntity>,
  gridKey: K,
): GridBinding<TEntity[K] extends unknown[] ? TEntity[K][number] : unknown> {
  const rows = controller.data.selectGrid(gridKey) as ComputedRef<unknown[]>

  const isReadonly = computed(() => {
    // If the entire screen state machine is not editable, the grid is read-only
    return !controller.state.isEditable
  })

  return {
    rows,
    readonly: isReadonly,
  }
}
