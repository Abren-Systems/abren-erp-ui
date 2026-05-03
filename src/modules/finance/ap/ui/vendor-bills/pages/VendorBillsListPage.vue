<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import type { Row } from '@tanstack/vue-table'
import { AppButton, AppSidePane } from '@/shared/components/primitives'
import {
  WorkspaceLayout,
  WorkspaceToolbar,
  WorkspaceTabs,
  WorkspaceFooter,
} from '@/shared/components/workspace'
import { History, Plus, Receipt, FileText, ChevronRight } from 'lucide-vue-next'
import { useVendorBills } from '../../../application/composables/useVendorBills'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { VendorBill } from '../../../domain/ap.types'
import { MoneyCell, DateCell, BadgeCell } from '@/shared/components/data-grid'
import VendorBillTimeline from '../components/VendorBillTimeline.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const { bills, isLoading } = useVendorBills()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

const isTraceOpen = ref(false)
const traceTarget = ref<VendorBill | null>(null)

const statusFilter = ref('all')

const smartTabs = computed(() => {
  const data = bills.value ?? []
  return [
    {
      id: 'all',
      label: 'ALL',
      subLabel: `Total: ${data.length}`,
      count: data.length,
    },
    {
      id: 'draft',
      label: 'DRAFT',
      subLabel: `Awaiting: ${data.filter((b) => b.status === 'DRAFT').length}`,
      count: data.filter((b) => b.status === 'DRAFT').length,
    },
    {
      id: 'validated',
      label: 'READY',
      subLabel: `Accrual: ${data.filter((b) => b.status === 'VALIDATED').length}`,
      count: data.filter((b) => b.status === 'VALIDATED').length,
    },
  ]
})

const filteredBills = computed(() => {
  if (!bills.value) return []
  if (statusFilter.value === 'all') return bills.value
  return bills.value.filter((b) => b.status.toLowerCase() === statusFilter.value)
})

const totalFilteredAmount = computed(() => {
  return filteredBills.value.reduce(
    (acc, b) => acc + (b.totalAmount ? Number(b.totalAmount) : 0),
    0,
  )
})

const columns = [
  {
    accessorKey: 'billNumber',
    header: 'Bill #',
    cell: ({ row }: { row: Row<VendorBill> }) =>
      h('span', { class: 'font-mono font-bold text-neutral-900' }, row.original.billNumber),
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }: { row: Row<VendorBill> }) => h(DateCell, { date: row.original.issueDate }),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }: { row: Row<VendorBill> }) =>
      h(MoneyCell, {
        amount: row.original.totalAmount,
        class: 'block text-right font-bold',
      }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<VendorBill> }) => h(BadgeCell, { status: row.original.status }),
  },
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
    <WorkspaceToolbar title="Vendor Bills">
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
          Register Bill
        </AppButton>
      </template>
      <template #tabs>
        <WorkspaceTabs v-model="statusFilter" :tabs="smartTabs" />
      </template>
    </WorkspaceToolbar>

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
      class="flex-1 border-0 border-t border-[var(--color-neutral-200)]"
      @row-click="handleRowClick"
    >
      <template #footer>
        <WorkspaceFooter :total-rows="filteredBills.length" />
      </template>
    </DataGrid>

    <template #sidebar>
      <!-- Contextual SidePane (Audit Trace) -->
      <AppSidePane
        v-model:open="isTraceOpen"
        :title="`Trace: ${traceTarget?.billNumber}`"
        description="Audit provenance and status history"
        mode="docked"
        width="320px"
      >
        <template #icon>
          <History :size="16" class="text-[var(--color-primary-600)]" />
        </template>

        <div v-if="traceTarget" class="space-y-6">
          <VendorBillTimeline :bill="traceTarget" />
        </div>

        <template #footer>
          <AppButton
            v-if="traceTarget"
            variant="outline"
            size="sm"
            class="w-full h-8 text-[11px]"
            @click="handleRowClick(traceTarget)"
          >
            Open Full Record
            <ChevronRight :size="14" class="ml-1" />
          </AppButton>
        </template>
      </AppSidePane>
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
