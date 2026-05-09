<script setup lang="ts">
import { useVueTable, getCoreRowModel, createColumnHelper, FlexRender } from '@tanstack/vue-table'
import type { ARInvoiceLine } from '../../domain/invoice.schema'
import { Trash2, Plus } from 'lucide-vue-next'
import { h } from 'vue'

const props = defineProps<{
  lines: ARInvoiceLine[]
  readonly: boolean
}>()

const emit = defineEmits<{
  (e: 'update', index: number, patch: Partial<ARInvoiceLine>): void
  (e: 'remove', index: number): void
  (e: 'add'): void
}>()

const columnHelper = createColumnHelper<ARInvoiceLine>()

const columns = [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (info) =>
      props.readonly
        ? info.getValue()
        : h('input', {
            class: 'grid-input',
            value: info.getValue(),
            onInput: (e: Event) =>
              emit('update', info.row.index, { description: (e.target as HTMLInputElement).value }),
          }),
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: (info) =>
      props.readonly
        ? info.getValue()
        : h('input', {
            type: 'number',
            class: 'grid-input text-right',
            value: info.getValue(),
            onInput: (e: Event) =>
              emit('update', info.row.index, {
                quantity: Number((e.target as HTMLInputElement).value),
              }),
          }),
  }),
  columnHelper.accessor('unitPrice', {
    header: 'Unit Price',
    cell: (info) =>
      props.readonly
        ? info.getValue().toFixed(2)
        : h('input', {
            type: 'number',
            class: 'grid-input text-right',
            value: info.getValue(),
            onInput: (e: Event) =>
              emit('update', info.row.index, {
                unitPrice: Number((e.target as HTMLInputElement).value),
              }),
          }),
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) =>
      info.getValue()
        ? info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2 })
        : '0.00',
  }),
  columnHelper.display({
    id: 'actions',
    cell: (info) =>
      !props.readonly &&
      h(
        'button',
        {
          class: 'btn-icon-danger',
          onClick: () => emit('remove', info.row.index),
        },
        [h(Trash2, { class: 'w-4 h-4' })],
      ),
  }),
]

const table = useVueTable({
  get data() {
    return props.lines
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div class="grid-container">
    <div class="grid-toolbar" v-if="!readonly">
      <button class="btn-secondary btn-sm flex items-center gap-2" @click="emit('add')">
        <Plus class="w-4 h-4" />
        Add Line
      </button>
    </div>

    <div class="grid-scroll">
      <table class="erp-grid">
        <thead>
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
          <tr v-if="lines.length === 0">
            <td :colspan="columns.length" class="empty-state">No lines added.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.grid-toolbar {
  display: flex;
  justify-content: flex-end;
}

.grid-scroll {
  overflow-x: auto;
  border: 1px solid var(--color-neutral-200);
  border-radius: 8px;
}

.erp-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.erp-grid th {
  background: var(--color-neutral-50);
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-neutral-700);
  border-bottom: 2px solid var(--color-neutral-200);
  white-space: nowrap;
}

.erp-grid td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-neutral-100);
  color: var(--color-neutral-900);
}

.grid-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.grid-input:focus {
  background: white;
  border-color: var(--color-primary-500);
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.text-right {
  text-align: right;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--color-neutral-400);
  font-style: italic;
}

.btn-icon-danger {
  padding: 0.4rem;
  color: var(--color-danger-600);
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon-danger:hover {
  background: var(--color-danger-50);
  color: var(--color-danger-700);
}
</style>
