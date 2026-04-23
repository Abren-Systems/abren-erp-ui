<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import type { Table, Row } from '@tanstack/vue-table'
import { AppButton } from '@/shared/components/primitives'
import { PageHeader } from '@/shared/components/workspace'
import { CheckCircle, XCircle, Plus } from 'lucide-vue-next'
import { usePaymentRequests } from '../../../application/composables/usePaymentRequests'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { PaymentRequest } from '../../../domain/ap.types'
import { h } from 'vue'
import { MoneyCell, DateCell, BadgeCell, SelectionCell } from '@/shared/components/data-grid'

const router = useRouter()
const { hasPermission } = usePermissions()
const { requests, isLoading } = usePaymentRequests()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
const statusFilter = ref('all')

const selectedCount = computed(() => Object.keys(rowSelection.value).length)

const filteredRequests = computed(() => {
  if (!requests.value) return []
  let data = requests.value
  if (statusFilter.value !== 'all') {
    data = data.filter((r) => r.status === statusFilter.value)
  }
  return data
})

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Rejected', value: 'REJECTED' },
]

const columns = [
  {
    id: 'select',
    header: ({ table }: { table: Table<PaymentRequest> }) =>
      h(SelectionCell, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected(),
        'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
      }),
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h(SelectionCell, {
        checked: row.getIsSelected(),
        'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
      }),
    size: 40,
  },
  {
    accessorKey: 'id',
    header: 'Request #',
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h(
        'code',
        { class: 'text-xs font-mono uppercase text-neutral-500' },
        row.original.id.slice(0, 8),
      ),
  },
  {
    accessorKey: 'beneficiaryId',
    header: 'Vendor',
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h('span', { class: 'font-medium' }, row.original.beneficiaryId.slice(0, 8)),
  },
  {
    accessorKey: 'totalAmount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h(MoneyCell, { amount: row.original.totalAmount, class: 'justify-end' }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h(BadgeCell, {
        status: row.original.status,
        variant:
          row.original.status === 'PAID'
            ? 'success'
            : row.original.status === 'REJECTED'
              ? 'danger'
              : 'warning',
      }),
  },
  {
    accessorKey: 'requesterId',
    header: 'Requested By',
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h('span', { class: 'text-neutral-500 text-xs' }, row.original.requesterId.slice(0, 8)),
  },
  {
    accessorKey: 'submittedAt',
    header: 'Date',
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h(DateCell, { date: row.original.submittedAt }),
  },
]

function goToDetail(pr: PaymentRequest) {
  void router.push({ name: 'PaymentRequestDetail', params: { id: pr.id } })
}

function handleCreate() {
  void router.push({ name: 'PaymentRequestCreate' })
}

function handleBulkApprove() {
  console.log('Bulk approve:', Object.keys(rowSelection.value))
}

function handleBulkReject() {
  console.log('Bulk reject:', Object.keys(rowSelection.value))
}
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="Payment Requests" description="All pending and processed payments">
      <template #actions>
        <AppButton v-if="hasPermission('ap:create')" variant="primary" @click="handleCreate">
          <template #start>
            <Plus :size="14" />
          </template>
          New Request
        </AppButton>
      </template>
    </PageHeader>

    <div
      class="rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-sm overflow-hidden"
    >
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :data="filteredRequests"
        :columns="columns"
        :loading="isLoading"
        placeholder="Search requests..."
        row-clickable
        @row-click="goToDetail"
      >
        <template #toolbar>
          <div v-if="selectedCount > 0" class="flex items-center gap-2">
            <AppButton variant="stealth" size="sm" @click="handleBulkReject">
              <template #start><XCircle :size="14" /></template>
              Reject Selected
            </AppButton>
            <AppButton variant="primary" size="sm" @click="handleBulkApprove">
              <template #start><CheckCircle :size="14" /></template>
              Approve Selected
            </AppButton>
          </div>

          <div v-else class="flex items-center gap-1.5 ml-2">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              class="h-7 px-3 text-[11px] font-semibold rounded-full border transition-all"
              :class="[
                statusFilter === opt.value
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300',
              ]"
              @click="statusFilter = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
