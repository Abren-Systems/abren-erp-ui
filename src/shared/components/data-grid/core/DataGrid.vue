<script setup lang="ts" generic="TData, TValue">
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
} from '@tanstack/vue-table'
import { computed } from 'vue'
import DataGridToolbar from '../plugins/DataGridToolbar.vue'
import DataGridSkeleton from './DataGridSkeleton.vue'
import DataGridEmpty from './DataGridEmpty.vue'

// ─── Props & Models ──────────────────────────────────────────────────────────

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    loading?: boolean
    skeletonRows?: number
    placeholder?: string
    showToolbar?: boolean
  }>(),
  {
    skeletonRows: 8,
    showToolbar: true,
    loading: false,
  },
)

// Two-way bindings via defineModel (Vue 3.3+)
const sorting = defineModel<SortingState>('sorting', { default: () => [] })
const rowSelection = defineModel<RowSelectionState>('rowSelection', { default: () => ({}) })
const columnVisibility = defineModel<VisibilityState>('columnVisibility', { default: () => ({}) })
const globalFilter = defineModel<string>('globalFilter', { default: '' })

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
  enableRowSelection: true,
  globalFilterFn: 'includesString',

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
})

const colCount = computed(() => props.columns.length)
const selectedCount = computed(() => Object.keys(rowSelection.value).length)
</script>

<template>
  <div class="data-grid">
    <!-- ── Toolbar ─────────────────────────── -->
    <DataGridToolbar
      v-if="showToolbar"
      v-model="globalFilter"
      :placeholder="placeholder"
      :selected-count="selectedCount"
    >
      <slot name="toolbar" />
    </DataGridToolbar>

    <!-- ── Table ───────────────────────────── -->
    <div class="grid-scroll-container">
      <table class="grid-table">
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
              class="grid-th"
              :style="{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="grid-tbody">
          <!-- Loading skeleton -->
          <DataGridSkeleton v-if="loading" :rows="skeletonRows" :colspan="colCount" />

          <!-- Data rows -->
          <template v-else-if="table.getRowModel().rows.length">
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="grid-row"
              :class="{ 'grid-row--selected': row.getIsSelected() }"
              @click="row.toggleSelected()"
            >
              <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="grid-td">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <DataGridEmpty v-else :colspan="colCount">
            <template #action>
              <slot name="empty-action" />
            </template>
          </DataGridEmpty>
        </tbody>
      </table>
    </div>

    <!-- Optional footer slot (pagination, totals) -->
    <div v-if="$slots.footer" class="grid-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.data-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-grid-bg);
  border: 1px solid var(--color-grid-header-border);
  border-radius: 6px;
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
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--color-grid-text);
}

.grid-thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--color-grid-header-bg);
}

.grid-header-row {
  height: 30px;
}

.grid-th {
  padding: 0 8px;
  text-align: left;
  border-bottom: 1px solid var(--color-grid-header-border);
  border-right: 1px solid var(--color-grid-col-divider);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.grid-th:last-child {
  border-right: none;
}

.grid-row {
  height: 30px;
  border-bottom: 1px solid var(--color-grid-divider);
  cursor: pointer;
  transition: background 0ms;
}

.grid-row:hover {
  background: var(--color-grid-row-hover);
}
.grid-row--selected {
  background: var(--color-grid-row-selected) !important;
}
.grid-row--selected:hover {
  background: var(--color-grid-row-selected-hover) !important;
}

.grid-td {
  padding: 6px 8px;
  border-right: 1px solid var(--color-grid-col-divider);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-td:last-child {
  border-right: none;
}

.grid-footer {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  border-top: 1px solid var(--color-grid-header-border);
  background: var(--color-grid-header-bg);
  font-size: 12px;
  color: var(--color-grid-text-muted);
}
</style>
