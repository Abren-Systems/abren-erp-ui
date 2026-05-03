<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  DataGrid,
  DataGridFilterSelector,
  DataGridFooter,
  useDataGrid,
} from '@/shared/components/data-grid'
import type { Table, Row } from '@tanstack/vue-table'
import { AppButton, AppSidePane } from '@/shared/components/primitives'
import { WorkspaceLayout, PageHeader } from '@/shared/components/workspace'
import { History, Plus, Receipt, FileText, ChevronRight, ListFilter, X } from 'lucide-vue-next'
import { useVendorBills } from '../../../application/composables/useVendorBills'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { VendorBill } from '../../../domain/ap.types'
import { Money } from '@/shared/domain/money'
import { SelectionCell } from '@/shared/components/data-grid'
import type { VendorBillId } from '@/shared/types/brand.types'
import { vendorBillColumns } from '../grids/vendor-bill.grid'
import VendorBillTraceSidePane from '../components/VendorBillTraceSidePane.vue'
import VendorBillFilterPane from '../components/VendorBillFilterPane.vue'
import VendorBillBulkActionBar from '../components/VendorBillBulkActionBar.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const { bills, isLoading } = useVendorBills()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

const isTraceOpen = ref(false)
const traceTarget = ref<VendorBill | null>(null)

const statusFilter = ref('all')
const isFilterOpen = ref(false)
const filterState = ref({
  statuses: [] as string[],
  dateFrom: '',
  dateTo: '',
})

const selectedIds = computed(() => {
  return Object.keys(rowSelection.value)
    .filter((k) => rowSelection.value[k])
    .map((k) => filteredBills.value[Number(k)]?.id)
    .filter(Boolean) as VendorBillId[]
})

const filterPresets = [
  { id: 'all', label: 'All Records' },
  { id: 'draft', label: 'Draft' },
  { id: 'validated', label: 'Ready for Accrual' },
]

const filteredBills = computed(() => {
  if (!bills.value) return []
  let data = bills.value

  // 1. Bucket Filtering (Tabs)
  if (statusFilter.value === 'draft') {
    data = data.filter((b) => b.status === 'DRAFT')
  } else if (statusFilter.value === 'validated') {
    data = data.filter((b) => b.status === 'VALIDATED')
  }

  // 2. Fine-grained Filtering (Drawer)
  if (filterState.value.statuses.length > 0) {
    data = data.filter((b) => filterState.value.statuses.includes(b.status))
  }

  if (filterState.value.dateFrom) {
    data = data.filter((b) => b.issueDate >= filterState.value.dateFrom)
  }
  if (filterState.value.dateTo) {
    data = data.filter((b) => b.issueDate <= filterState.value.dateTo)
  }

  return data
})

const selectedCount = computed(() => Object.keys(rowSelection.value).length)

const totalFilteredAmount = computed(() => {
  return filteredBills.value.reduce(
    (acc, b) => acc.add(b.totalAmount || Money.zero()),
    Money.zero(),
  )
})

const columns = [
  {
    id: 'select',
    header: ({ table }: { table: Table<VendorBill> }) =>
      h(SelectionCell, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected(),
        'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
      }),
    cell: ({ row }: { row: Row<VendorBill> }) =>
      h(SelectionCell, {
        checked: row.getIsSelected(),
        'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
      }),
    size: 40,
  },
  ...vendorBillColumns,
  {
    id: 'actions',
    header: '',
    cell: ({ row }: { row: Row<VendorBill> }) => {
      const isActive = traceTarget.value?.id === row.original.id && isTraceOpen.value
      return h('div', { class: 'flex justify-end pr-2' }, [
        h(
          AppButton,
          {
            variant: 'stealth',
            size: 'sm',
            class: ['h-7 w-7 p-0 trace-action-btn', isActive && 'is-active'],
            onClick: (e: Event) => {
              e.stopPropagation()
              traceTarget.value = row.original
              isTraceOpen.value = true
            },
          },
          () => h(History, { size: 14 }),
        ),
      ])
    },
  },
]

function handleRowClick(bill: VendorBill) {
  void router.push({ name: 'VendorBillDetail', params: { id: bill.id } })
}

function handleCreate() {
  void router.push({ name: 'VendorBillCreate' })
}
</script>

<template>
  <WorkspaceLayout>
    <template #header>
      <PageHeader title="Vendor Bills" plain>
        <template #actions>
          <AppButton
            v-if="hasPermission('ap:create')"
            variant="primary"
            size="sm"
            @click="handleCreate"
          >
            <template #start>
              <Plus :size="14" />
            </template>
            New
          </AppButton>
        </template>
      </PageHeader>
    </template>

    <DataGrid
      v-model:sorting="sorting"
      v-model:row-selection="rowSelection"
      v-model:column-visibility="columnVisibility"
      v-model:global-filter="globalFilter"
      :data="filteredBills"
      :columns="columns"
      :loading="isLoading"
      placeholder="Search bills by number or vendor..."
      row-clickable
      class="flex-1"
      @row-click="handleRowClick"
    >
      <template #toolbar>
        <DataGridFilterSelector v-model="statusFilter" :options="filterPresets" />
      </template>

      <template #toolbar-controls>
        <AppButton variant="outline" size="sm" @click="isFilterOpen = true">
          <template #start><ListFilter :size="14" /></template>
          Filter
        </AppButton>
      </template>

      <template #empty-action>
        <AppButton
          v-if="statusFilter !== 'all' || filterState.statuses.length > 0"
          variant="outline"
          @click="
            () => {
              statusFilter = 'all'
              filterState.statuses = []
            }
          "
        >
          <template #start><X :size="14" /></template>
          Clear filters
        </AppButton>
      </template>

      <template #footer>
        <DataGridFooter
          :total-rows="filteredBills.length"
          :selected-count="selectedCount"
          :total-amount-formatted="totalFilteredAmount.format()"
        />
      </template>
    </DataGrid>

    <VendorBillBulkActionBar
      :selected-ids="selectedIds"
      :filtered-bills="filteredBills"
      @clear-selection="rowSelection = {}"
    />

    <template #sidebar>
      <VendorBillFilterPane
        v-model:open="isFilterOpen"
        :initial-filters="filterState"
        :status-options="[
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Validated', value: 'VALIDATED' },
          { label: 'Paid', value: 'PAID' },
        ]"
        @apply="filterState = $event"
      />

      <VendorBillTraceSidePane v-model:open="isTraceOpen" :bill="traceTarget!" />
    </template>
  </WorkspaceLayout>
</template>

<style scoped>
:deep(.grid-row) .trace-action-btn {
  opacity: 0;
  transition: all 0.2s ease;
}

:deep(.grid-row:hover) .trace-action-btn {
  opacity: 1;
}

:deep(.grid-row) .trace-action-btn.is-active {
  opacity: 1 !important;
  color: var(--color-primary-600);
  background: var(--color-primary-50);
}
</style>
