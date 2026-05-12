<script setup lang="ts" generic="TData, TValue">
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
  type PaginationState,
  type ColumnSizingState,
  type ColumnPinningState,
  type Row,
} from '@tanstack/vue-table'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref } from 'vue'
import DataGridToolbar from '../plugins/DataGridToolbar.vue'
import DataGridSkeleton from './DataGridSkeleton.vue'
import DataGridEmpty from './DataGridEmpty.vue'
import DataGridPagination from '../plugins/DataGridPagination.vue'
import type { GridDensity } from '../../composables/useDataGrid'

// ─── Props & Models ──────────────────────────────────────────────────────────

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    totalCount?: number
    loading?: boolean
    skeletonRows?: number
    placeholder?: string
    showToolbar?: boolean
    emptyMessage?: string
    rowClickable?: boolean
    virtualize?: boolean
  }>(),
  {
    skeletonRows: 8,
    showToolbar: true,
    loading: false,
    rowClickable: false,
    virtualize: true,
  },
)

// Two-way bindings via defineModel (Vue 3.3+)
const sorting = defineModel<SortingState>('sorting', { default: () => [] })
const rowSelection = defineModel<RowSelectionState>('rowSelection', {
  default: () => ({}),
})
const columnVisibility = defineModel<VisibilityState>('columnVisibility', {
  default: () => ({}),
})
const globalFilter = defineModel<string>('globalFilter', { default: '' })
const density = defineModel<GridDensity>('density', { default: 'standard' })
const pagination = defineModel<PaginationState>('pagination', {
  default: () => ({ pageIndex: 0, pageSize: 50 }),
})
const columnSizing = defineModel<ColumnSizingState>('columnSizing', { default: () => ({}) })
const columnPinning = defineModel<ColumnPinningState>('columnPinning', {
  default: () => ({ left: [], right: [] }),
})

// ─── TanStack Table ──────────────────────────────────────────────────────────

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  enableRowSelection: true,
  enableColumnResizing: true,
  columnResizeMode: 'onChange',
  globalFilterFn: 'includesString',

  // Server-side pagination support
  manualPagination: computed(() => props.totalCount !== undefined),
  get rowCount() {
    return props.totalCount
  },

  state: {
    get sorting() {
      return sorting.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get pagination() {
      return pagination.value
    },
    get columnSizing() {
      return columnSizing.value
    },
    get columnPinning() {
      return columnPinning.value
    },
  },

  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater
  },
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value =
      typeof updater === 'function' ? updater(columnVisibility.value) : updater
  },
  onGlobalFilterChange: (val) => {
    globalFilter.value = val
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
  onColumnSizingChange: (updater) => {
    columnSizing.value = typeof updater === 'function' ? updater(columnSizing.value) : updater
  },
  onColumnPinningChange: (updater) => {
    columnPinning.value = typeof updater === 'function' ? updater(columnPinning.value) : updater
  },
})

// ─── Virtualization ──────────────────────────────────────────────────────────

const scrollContainerRef = ref<HTMLDivElement | null>(null)

const rowHeightMap = {
  compact: 28,
  standard: 36,
  relaxed: 44,
}

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: table.getRowModel().rows.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => rowHeightMap[density.value],
    overscan: 10,
  })),
)

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalVirtualHeight = computed(() => rowVirtualizer.value.getTotalSize())

const colCount = computed(() => props.columns.length)
const selectedCount = computed(() => Object.keys(rowSelection.value).length)

const emit = defineEmits<{
  (e: 'row-click', data: TData): void
}>()

const handleRowClick = (row: Row<TData>) => {
  if (props.rowClickable) {
    emit('row-click', row.original)
  }
}
</script>

<template>
  <div class="data-grid">
    <!-- ── Toolbar ─────────────────────────── -->
    <DataGridToolbar
      v-if="showToolbar"
      v-model="globalFilter"
      v-model:density="density"
      :placeholder="placeholder"
      :selected-count="selectedCount"
    >
      <slot name="toolbar" />
      <template #controls>
        <slot name="toolbar-controls" />
      </template>
    </DataGridToolbar>

    <!-- ── Table ───────────────────────────── -->
    <div class="grid-scroll-container" ref="scrollContainerRef">
      <table class="grid-table" :style="{ width: table.getTotalSize() + 'px' }">
        <!-- Sticky Header -->
        <thead class="grid-thead">
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="grid-header-row"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="grid-th group"
              :style="{ width: `${header.getSize()}px` }"
            >
              <div class="flex items-center justify-between w-full h-full relative">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />

                <div
                  v-if="header.column.getCanResize()"
                  @mousedown="header.getResizeHandler()($event)"
                  @touchstart="header.getResizeHandler()($event)"
                  class="resizer opacity-0 group-hover:opacity-100 transition-opacity"
                  :class="{ isResizing: header.column.getIsResizing() }"
                ></div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody
          class="grid-tbody"
          :style="virtualize ? { height: `${totalVirtualHeight}px`, position: 'relative' } : {}"
        >
          <!-- Loading skeleton -->
          <DataGridSkeleton v-if="loading" :rows="skeletonRows" :colspan="colCount" />

          <!-- Data rows -->
          <template v-else-if="table.getRowModel().rows.length">
            <template v-if="virtualize">
              <tr
                v-for="virtualRow in virtualRows"
                :key="virtualRow.index"
                class="grid-row"
                :class="[
                  `grid-row--${density}`,
                  {
                    'grid-row--selected': table
                      .getRowModel()
                      .rows[virtualRow.index].getIsSelected(),
                  },
                ]"
                :style="{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }"
                @click="handleRowClick(table.getRowModel().rows[virtualRow.index])"
              >
                <td
                  v-for="cell in table.getRowModel().rows[virtualRow.index].getVisibleCells()"
                  :key="cell.id"
                  class="grid-td"
                  :style="{ width: `${cell.column.getSize()}px` }"
                >
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                class="grid-row"
                :class="[`grid-row--${density}`, { 'grid-row--selected': row.getIsSelected() }]"
                @click="handleRowClick(row)"
              >
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="grid-td"
                  :style="{ width: `${cell.column.getSize()}px` }"
                >
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </td>
              </tr>
            </template>
          </template>

          <!-- Empty state -->
          <DataGridEmpty v-else :colspan="colCount" :message="emptyMessage">
            <template #action>
              <slot name="empty-action" />
            </template>
          </DataGridEmpty>
        </tbody>
      </table>
    </div>

    <!-- Optional footer slot (pagination, totals) -->
    <div class="grid-footer">
      <slot name="footer">
        <DataGridPagination :table="table" />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.data-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: none;
  border-radius: 0;
  overflow: hidden;
  font-family: var(--font-sans);
}

.grid-scroll-container {
  flex: 1;
  overflow: auto;
}

.grid-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px; /* High-density standard */
  line-height: 1.2;
  color: var(--color-neutral-800);
}

.grid-thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--color-neutral-50);
}

.grid-header-row {
  height: var(--grid-row-standard);
}

.grid-th {
  padding: 0 var(--grid-cell-px);
  text-align: left;
  font-size: 11px;
  font-weight: 800; /* Extra bold for headers */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neutral-500);
  border-bottom: 1px solid var(--color-neutral-200);
  border-right: 1px solid var(--color-neutral-100);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.grid-th:last-child {
  border-right: none;
}

.grid-row {
  height: var(--grid-row-standard);
  border-bottom: 1px solid var(--color-neutral-100);
  cursor: pointer;
  background: #ffffff;
  transition: all 0.05s ease;
  position: relative;
}

.grid-row:nth-child(even) {
  background: var(--color-neutral-50) / 30; /* Subtle zebra striping */
}

.grid-row:hover {
  background: var(--color-neutral-100);
}

.grid-row--selected {
  background: var(--color-primary-50) !important;
  color: var(--color-primary-900);
  font-weight: 500;
}

/* Vertical indicator for selected row */
.grid-row--selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary-600);
  z-index: 1;
}

.grid-row--selected:hover {
  background: var(--color-primary-100) !important;
}

.grid-td {
  padding: 0 var(--grid-cell-px);
  border-right: 1px solid transparent;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-td:last-child {
  border-right: none;
}

.grid-row--compact {
  height: var(--grid-row-compact);
}
.grid-row--compact .grid-td {
  padding: 0 8px;
  font-size: 11px;
}

.grid-row--standard {
  height: var(--grid-row-standard);
}

.grid-row--relaxed {
  height: var(--grid-row-relaxed);
}
.grid-row--relaxed .grid-td {
  padding: 0 16px;
  font-size: 13px;
}

/* Resizer Handle */
.resizer {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 5px;
  background: var(--color-primary-500);
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}
.resizer.isResizing {
  background: var(--color-primary-600);
  width: 5px;
  opacity: 1;
}

.grid-footer {
  display: flex;
  align-items: center;
  height: var(--grid-footer-h);
  padding: 0 var(--grid-cell-px);
  border-top: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-50);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-neutral-500);
}
</style>
