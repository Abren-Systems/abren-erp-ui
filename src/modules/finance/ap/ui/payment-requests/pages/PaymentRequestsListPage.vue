<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import type { Table, Row } from '@tanstack/vue-table'
import { AppButton } from '@/shared/components/primitives'
import {
  WorkspaceLayout,
  WorkspaceToolbar,
  WorkspaceTabs,
  WorkspaceFooter,
} from '@/shared/components/workspace'
import { CheckCircle, XCircle, Plus } from 'lucide-vue-next'
import { usePaymentRequests } from '../../../application/composables/usePaymentRequests'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { PaymentRequest } from '../../../domain/ap.types'
import { h } from 'vue'
import { MoneyCell, DateCell, BadgeCell, SelectionCell } from '@/shared/components/data-grid'
import { History, X, ListFilter, Calendar, Download } from 'lucide-vue-next'
import PaymentRequestBulkActionBar from '../components/PaymentRequestBulkActionBar.vue'
import PaymentRequestFilterPane from '../components/PaymentRequestFilterPane.vue'
import PaymentRequestTracePane from '../components/PaymentRequestTracePane.vue'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import type { User } from '@/modules/core/domain/user.types'
import { Money } from '@/shared/domain/money'

const router = useRouter()
const { hasPermission } = usePermissions()
const { requests, isLoading } = usePaymentRequests()
const { users } = useUsers()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
const statusFilter = ref('all')
const isFilterOpen = ref(false)
const filterState = ref({
  statuses: [] as string[],
  dateFrom: '',
  dateTo: '',
})

const smartTabs = computed(() => [
  {
    id: 'all',
    label: 'ALL',
    subLabel: `Total: ${requests.value?.length || 0}`,
    count: requests.value?.length || 0,
    isActive: statusFilter.value === 'all',
  },
  {
    id: 'needs_attention',
    label: 'NEEDS ATTENTION',
    subLabel: `Rejected: ${requests.value?.filter((r) => r.status === 'REJECTED').length || 0}`,
    count: requests.value?.filter((r) => ['DRAFT', 'REJECTED'].includes(r.status)).length || 0,
    isActive: statusFilter.value === 'needs_attention',
  },
  {
    id: 'in_review',
    label: 'IN REVIEW',
    subLabel: `Pending: ${requests.value?.filter((r) => ['SUBMITTED', 'APPROVED'].includes(r.status)).length || 0}`,
    count:
      requests.value?.filter((r) => ['SUBMITTED', 'APPROVED', 'AUTHORIZED'].includes(r.status))
        .length || 0,
    isActive: statusFilter.value === 'in_review',
  },
])

const headerDescription = computed(() => {
  if (isLoading.value || !requests.value) return 'Loading operational metrics...'

  const active = requests.value.filter((r) =>
    ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'AUTHORIZED'].includes(r.status),
  )
  const count = active.length
  const total = active.reduce((acc, r) => acc.add(r.totalAmount), Money.zero())

  return `${count} Active • ${total.format()} Total`
})

const isTraceOpen = ref(false)
const traceTarget = ref<PaymentRequest | null>(null)

const selectedCount = computed(() => Object.keys(rowSelection.value).length)
const totalFilteredAmount = computed(() => {
  return filteredRequests.value.reduce((acc, r) => acc.add(r.totalAmount), Money.zero())
})

const filteredRequests = computed(() => {
  if (!requests.value) return []
  let data = requests.value

  // 1. Bucket Filtering (Tabs)
  if (statusFilter.value === 'needs_attention') {
    data = data.filter((r) => ['DRAFT', 'REJECTED'].includes(r.status))
  } else if (statusFilter.value === 'in_review') {
    data = data.filter((r) => ['SUBMITTED', 'APPROVED', 'AUTHORIZED'].includes(r.status))
  }

  // 2. Fine-grained Filtering (Drawer)
  if (filterState.value.statuses.length > 0) {
    data = data.filter((r) => filterState.value.statuses.includes(r.status))
  }

  // Hydrate names and add action logic
  return data.map((r) => {
    const requester = users.value?.find((u) => u.id === r.requesterId)
    const beneficiary = users.value?.find((u) => u.id === r.beneficiaryId)

    const formatName = (user?: User, id?: string) => {
      if (!user) return id?.slice(0, 8) || 'Unknown'
      return user.email || id?.slice(0, 8)
    }

    const getActionRequired = (status: string) => {
      switch (status) {
        case 'REJECTED':
          return { label: 'Edit & Resubmit', icon: XCircle, color: 'text-danger-600' }
        case 'DRAFT':
          return { label: 'Submit for Approval', icon: Plus, color: 'text-neutral-600' }
        case 'SUBMITTED':
          return { label: 'Review & Approve', icon: CheckCircle, color: 'text-warning-600' }
        case 'APPROVED':
          return { label: 'Authorize Payment', icon: CheckCircle, color: 'text-info-600' }
        default:
          return null
      }
    }

    return {
      ...r,
      requesterName: formatName(requester, r.requesterId),
      beneficiaryName: formatName(beneficiary, r.beneficiaryId),
      actionRequired: getActionRequired(r.status),
    }
  })
})

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Authorized', value: 'AUTHORIZED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
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
  ...paymentRequestColumns,
  {
    id: 'action_required',
    header: 'ACTION REQUIRED?',
    cell: ({ row }: { row: Row<PaymentRequest> }) => {
      const action = row.original.actionRequired
      if (!action) return null
      return h('div', { class: ['flex items-center gap-1.5 font-medium', action.color] }, [
        h(action.icon, { size: 14 }),
        h('span', { class: 'text-[11px]' }, action.label),
      ])
    },
    size: 160,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }: { row: Row<PaymentRequest> }) =>
      h(
        'div',
        { class: 'flex justify-end pr-2' },
        h(
          AppButton,
          {
            variant: 'stealth',
            size: 'sm',
            class: [
              'trace-action-btn',
              traceTarget.value?.id === row.original.id && isTraceOpen.value ? 'is-active' : '',
            ],
            onClick: (e: Event) => {
              e.stopPropagation()
              handleTrace(row.original)
            },
          },
          () => h(History, { size: 14 }),
        ),
      ),
    size: 60,
  },
]

function handleTrace(pr: PaymentRequest) {
  if (traceTarget.value?.id === pr.id && isTraceOpen.value) {
    isTraceOpen.value = false
    return
  }
  traceTarget.value = pr
  isTraceOpen.value = true
}

function goToDetail(pr: PaymentRequest) {
  void router.push({ name: 'PaymentRequestDetail', params: { id: pr.id } })
}

function handleCreate() {
  void router.push({ name: 'PaymentRequestDetail', params: { id: 'new' } })
}

const selectedIds = computed(() => {
  return Object.keys(rowSelection.value) as PaymentRequestId[]
})
</script>

<template>
  <WorkspaceLayout>
    <WorkspaceToolbar title="Payment Requests">
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
          New Request
        </AppButton>
      </template>
      <template #tabs>
        <WorkspaceTabs v-model="statusFilter" :tabs="smartTabs" />
      </template>
      <template #controls>
        <AppButton variant="outline" size="sm" @click="isFilterOpen = true">
          <template #start><ListFilter :size="14" /></template>
          Filter
        </AppButton>
      </template>
    </WorkspaceToolbar>

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
      class="flex-1 border-0 border-t border-[var(--color-neutral-200)]"
      @row-click="goToDetail"
    >
      <template #empty-action>
        <AppButton
          variant="outline"
          size="sm"
          @click="
            ;((statusFilter = 'all'),
              (filterState = { statuses: [], dateFrom: '', dateTo: '' }),
              (globalFilter = ''))
          "
        >
          Clear all filters
        </AppButton>
      </template>

      <!-- DataGrid Smart Footer -->
      <template #footer>
        <WorkspaceFooter
          :total-rows="filteredRequests.length"
          :selected-count="selectedCount"
          :total-amount-formatted="totalFilteredAmount.format()"
        />
      </template>
    </DataGrid>

    <!-- Floating Bulk Action Bar & Overlay -->
    <PaymentRequestBulkActionBar
      :selected-ids="selectedIds"
      :filtered-requests="filteredRequests"
      @clear-selection="rowSelection = {}"
    />

    <!-- Sidebars -->
    <template #sidebar>
      <!-- Filter Sidebar -->
      <PaymentRequestFilterPane
        v-model:open="isFilterOpen"
        :initial-filters="filterState"
        :status-options="statusOptions"
        @apply="filterState = $event"
      />

      <!-- Contextual Sidebar (Audit Trail) -->
      <PaymentRequestTracePane
        v-model:open="isTraceOpen"
        :request="traceTarget"
        @view-detail="goToDetail"
      />
    </template>
  </WorkspaceLayout>
</template>

<style scoped>
/* Trace Action Visibility Logic */
:deep(.grid-row) .trace-action-btn {
  opacity: 0;
  transition: all 0.2s ease;
  color: var(--color-neutral-400);
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
