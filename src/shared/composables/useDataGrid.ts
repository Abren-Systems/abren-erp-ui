/**
 * useDataGrid — central state factory for the ERP DataGrid.
 *
 * Returns reactive state objects compatible with TanStack Table v8.
 * Pass the returned `state` object directly into <DataGrid :state="state" />.
 *
 * All grid state (sorting, selection, filters, visibility) is co-located here
 * so that parent components stay thin and grid resets are trivially composable.
 *
 * @example
 *   const grid = useDataGrid()
 *   // Reset selection after a bulk action
 *   grid.resetSelection()
 */
import { ref } from 'vue'
import type {
  SortingState,
  RowSelectionState,
  VisibilityState,
  ColumnFiltersState,
  PaginationState,
  ColumnSizingState,
  ColumnPinningState,
} from '@tanstack/vue-table'

export type GridDensity = 'compact' | 'standard' | 'relaxed'

export interface DataGridState {
  sorting: SortingState
  rowSelection: RowSelectionState
  columnVisibility: VisibilityState
  columnFilters: ColumnFiltersState
  globalFilter: string
  pagination: PaginationState
  columnSizing: ColumnSizingState
  columnPinning: ColumnPinningState
  density: GridDensity
}

export function useDataGrid() {
  const sorting = ref<SortingState>([])
  const rowSelection = ref<RowSelectionState>({})
  const columnVisibility = ref<VisibilityState>({})
  const columnFilters = ref<ColumnFiltersState>([])
  const globalFilter = ref('')

  const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 50 })
  const columnSizing = ref<ColumnSizingState>({})
  const columnPinning = ref<ColumnPinningState>({ left: [], right: [] })
  const density = ref<GridDensity>('standard')

  function resetSelection() {
    rowSelection.value = {}
  }

  function resetFilters() {
    columnFilters.value = []
    globalFilter.value = ''
  }

  function resetAll() {
    sorting.value = []
    rowSelection.value = {}
    columnVisibility.value = {}
    columnFilters.value = []
    globalFilter.value = ''
    pagination.value = { pageIndex: 0, pageSize: 50 }
    columnSizing.value = {}
  }

  const selectedCount = () => Object.keys(rowSelection.value).length

  return {
    sorting,
    rowSelection,
    columnVisibility,
    columnFilters,
    globalFilter,
    pagination,
    columnSizing,
    columnPinning,
    density,
    selectedCount,
    resetSelection,
    resetFilters,
    resetAll,
  }
}
