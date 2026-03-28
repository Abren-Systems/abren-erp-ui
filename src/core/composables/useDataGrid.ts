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
} from '@tanstack/vue-table'

export interface DataGridState {
  sorting: SortingState
  rowSelection: RowSelectionState
  columnVisibility: VisibilityState
  columnFilters: ColumnFiltersState
  globalFilter: string
}

export function useDataGrid() {
  const sorting = ref<SortingState>([])
  const rowSelection = ref<RowSelectionState>({})
  const columnVisibility = ref<VisibilityState>({})
  const columnFilters = ref<ColumnFiltersState>([])
  const globalFilter = ref('')

  function resetSelection() {
    rowSelection.value = {}
  }

  function resetFilters() {
    /** Clears column-level filters and the global search string. */
    columnFilters.value = []
    globalFilter.value = ''
  }

  function resetAll() {
    /** Full reset — restores the grid to its initial unfiltered, unselected state. */
    sorting.value = []
    rowSelection.value = {}
    columnVisibility.value = {}
    columnFilters.value = []
    globalFilter.value = ''
  }

  /** Returns the number of currently selected rows. */
  const selectedCount = () => Object.keys(rowSelection.value).length

  return {
    sorting,
    rowSelection,
    columnVisibility,
    columnFilters,
    globalFilter,
    selectedCount,
    resetSelection,
    resetFilters,
    resetAll,
  }
}
