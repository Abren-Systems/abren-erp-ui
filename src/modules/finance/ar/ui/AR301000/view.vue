<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import type { useARInvoiceController } from './controller'
import AppTemplate from '@/platform/chrome/AppTemplate.vue'
import AppFieldset from '@/shared/components/field-system/AppFieldset.vue'
import AppField from '@/shared/components/field-system/AppField.vue'
import { SemanticKind } from '@/platform/semantic-runtime/contracts'
import { useVueTable, getCoreRowModel, createColumnHelper, FlexRender } from '@tanstack/vue-table'
import type { ARInvoiceLine } from '../../domain/invoice.schema'
import { Trash2, Plus } from 'lucide-vue-next'
import { h } from 'vue'

const props = defineProps<{
  id?: string
}>()

const ctrl = useScreenControllerContext<ReturnType<typeof useARInvoiceController>>()

// Inline Grid Logic
const columnHelper = createColumnHelper<ARInvoiceLine>()

const getColumns = () => [
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (info) =>
      !ctrl.model.value.domain.capabilities.canEdit
        ? info.getValue()
        : h('input', {
            class: 'grid-input',
            value: info.getValue(),
            onInput: (e: Event) =>
              ctrl.updateLine(info.row.index, {
                description: (e.target as HTMLInputElement).value,
              }),
          }),
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: (info) =>
      !ctrl.model.value.domain.capabilities.canEdit
        ? info.getValue()
        : h('input', {
            type: 'number',
            class: 'grid-input text-right',
            value: info.getValue(),
            onInput: (e: Event) =>
              ctrl.updateLine(info.row.index, {
                quantity: Number((e.target as HTMLInputElement).value),
              }),
          }),
  }),
  columnHelper.accessor('unitPrice', {
    header: 'Unit Price',
    cell: (info) =>
      !ctrl.model.value.domain.capabilities.canEdit
        ? info.getValue().toFixed(2)
        : h('input', {
            type: 'number',
            class: 'grid-input text-right',
            value: info.getValue(),
            onInput: (e: Event) =>
              ctrl.updateLine(info.row.index, {
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
      ctrl.model.value.domain.capabilities.canEdit &&
      h(
        'button',
        {
          class: 'btn-icon-danger',
          onClick: () => ctrl.removeLine(info.row.index),
        },
        [h(Trash2, { class: 'w-4 h-4' })],
      ),
  }),
]

const table = useVueTable({
  get data() {
    return ctrl.model.value.ui.grids.state.lines as ARInvoiceLine[]
  },
  get columns() {
    return getColumns()
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <AppTemplate :controller="ctrl">
    <template #header>
      <AppFieldset title="Document Summary">
        <div class="header-grid">
          <AppField v-bind="ctrl.fields.status" :semantic="SemanticKind.Status" />
          <AppField v-bind="ctrl.fields.customerId" />
          <AppField v-bind="ctrl.fields.date" />
          <AppField v-bind="ctrl.fields.currencyId" />
          <AppField v-bind="ctrl.fields.docAmount" :semantic="SemanticKind.Money" />
        </div>
      </AppFieldset>
    </template>

    <template #default>
      <div class="ar-invoice-content">
        <AppFieldset title="Details">
          <div class="grid-container">
            <div class="grid-toolbar" v-if="ctrl.model.value.domain.capabilities.canEdit">
              <button class="btn-secondary btn-sm flex items-center gap-2" @click="ctrl.addLine()">
                <Plus class="w-4 h-4" />
                Add Line
              </button>
            </div>

            <div class="grid-scroll">
              <table class="erp-grid">
                <thead>
                  <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                    <th v-for="header in headerGroup.headers" :key="header.id">
                      <FlexRender
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in table.getRowModel().rows" :key="row.id">
                    <td v-for="cell in row.getVisibleCells()" :key="cell.id">
                      <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    </td>
                  </tr>
                  <tr
                    v-if="(ctrl.model.value.ui.grids.state.lines as ARInvoiceLine[]).length === 0"
                  >
                    <td :colspan="columns.length" class="empty-state">No lines added.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AppFieldset>

        <div class="totals-section">
          <div class="totals-card">
            <div class="total-row">
              <span>Subtotal:</span>
              <span class="font-mono">
                {{ (ctrl.model.value.ui.grids.state.totals as { subtotal: number }).subtotal }}
              </span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span class="font-mono">
                {{ (ctrl.model.value.ui.grids.state.totals as { total: number }).total }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppTemplate>
</template>

<style scoped>
.header-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.ar-invoice-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.totals-section {
  display: flex;
  justify-content: flex-end;
}

.totals-card {
  width: 300px;
  background: var(--color-neutral-50);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--color-neutral-200);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-neutral-600);
}

.grand-total {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  border-top: 1px solid var(--color-neutral-200);
  padding-top: 0.75rem;
}

.font-mono {
  font-family: var(--font-mono);
}

/* Extracted from invoice-grid.vue */
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
