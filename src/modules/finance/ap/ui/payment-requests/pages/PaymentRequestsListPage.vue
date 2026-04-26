<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import type { Table, Row } from '@tanstack/vue-table'
import { AppButton, AppSidePane } from '@/shared/components/primitives'
import { PageHeader } from '@/shared/components/workspace'
import { CheckCircle, XCircle, Plus } from 'lucide-vue-next'
import { usePaymentRequests } from '../../../application/composables/usePaymentRequests'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { PaymentRequest } from '../../../domain/ap.types'
import { h } from 'vue'
import { MoneyCell, DateCell, BadgeCell, SelectionCell } from '@/shared/components/data-grid'
import { History, X, ListFilter, Calendar, Download } from 'lucide-vue-next'
import PaymentRequestTimeline from '../components/PaymentRequestTimeline.vue'
import { paymentRequestColumns } from '../grids/payment-request.grid'
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
  void router.push({ name: 'PaymentRequestCreate' })
}

function handleBulkApprove() {
  console.log('Bulk approve:', Object.keys(rowSelection.value))
}

function handleExport() {
  console.log('Export to CSV...')
}

function handleBulkReject() {
  console.log('Bulk reject:', Object.keys(rowSelection.value))
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <PageHeader title="Payment Requests" :description="headerDescription">
      <template #actions>
        <AppButton variant="outline" size="sm" @click="handleExport">
          <template #start>
            <Download :size="14" />
          </template>
          Export
        </AppButton>
        <AppButton v-if="hasPermission('ap:create')" variant="primary" @click="handleCreate">
          <template #start>
            <Plus :size="14" />
          </template>
          New Request
        </AppButton>
      </template>
    </PageHeader>

    <!-- Operational Split-Pane -->
    <div class="flex flex-1 gap-4 overflow-hidden min-h-0">
      <!-- Main Content Area (Grid) -->
      <div class="flex-1 min-w-0 transition-all duration-300 ease-in-out">
        <div
          class="h-full rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-sm overflow-hidden flex flex-col"
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
            class="flex-1"
            @row-click="goToDetail"
          >
            <template #toolbar>
              <div v-if="selectedCount > 0" class="flex items-center gap-2">
                <AppButton
                  v-if="selectedCount === 1"
                  variant="stealth"
                  size="sm"
                  @click="handleTrace(filteredRequests.find((r) => rowSelection[r.id])!)"
                >
                  <template #start><History :size="14" /></template>
                  Trace
                </AppButton>
                <div v-if="selectedCount === 1" class="h-4 w-px bg-neutral-200 mx-1" />

                <AppButton variant="stealth" size="sm" @click="handleBulkReject">
                  <template #start><XCircle :size="14" /></template>
                  Reject Selected
                </AppButton>
                <AppButton variant="primary" size="sm" @click="handleBulkApprove">
                  <template #start><CheckCircle :size="14" /></template>
                  Approve Selected
                </AppButton>
              </div>

              <div v-else class="flex items-center justify-between w-full pr-2">
                <div class="flex items-center gap-4">
                  <button
                    v-for="tab in smartTabs"
                    :key="tab.id"
                    class="group flex flex-col items-start px-4 py-2 border-r border-neutral-100 last:border-0 transition-all"
                    @click="statusFilter = tab.id"
                  >
                    <span
                      class="text-[10px] font-bold tracking-wider uppercase transition-colors"
                      :class="
                        tab.isActive
                          ? 'text-primary-600'
                          : 'text-neutral-400 group-hover:text-neutral-600'
                      "
                    >
                      {{ tab.label }}
                    </span>
                    <span
                      class="text-xs font-semibold mt-0.5"
                      :class="tab.isActive ? 'text-neutral-900' : 'text-neutral-500'"
                    >
                      {{ tab.subLabel }}
                    </span>
                    <div
                      class="h-0.5 w-full mt-2 rounded-full transition-all"
                      :class="tab.isActive ? 'bg-primary-600' : 'bg-transparent'"
                    />
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <AppButton variant="outline" size="sm" @click="isFilterOpen = true">
                    <template #start><ListFilter :size="14" /></template>
                    Filter
                  </AppButton>
                </div>
              </div>
            </template>
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
          </DataGrid>
        </div>
      </div>

      <!-- Filter Drawer -->
      <AppSidePane
        v-model:open="isFilterOpen"
        title="Filter Requests"
        description="Refine your workspace"
        show-backdrop
      >
        <template #icon>
          <div class="h-6 w-6 rounded-md bg-neutral-100 flex items-center justify-center">
            <ListFilter class="h-3.5 w-3.5 text-neutral-600" />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Status Multi-Select -->
          <div class="space-y-3">
            <h4 class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Status</h4>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="opt in statusOptions"
                :key="opt.value"
                class="flex items-center gap-2 p-2 rounded-lg border border-neutral-100 cursor-pointer hover:bg-neutral-50 transition-colors"
                :class="{
                  'bg-primary-50 border-primary-200': filterState.statuses.includes(opt.value),
                }"
              >
                <input
                  v-model="filterState.statuses"
                  type="checkbox"
                  :value="opt.value"
                  class="hidden"
                />
                <div
                  class="h-3.5 w-3.5 rounded border flex items-center justify-center"
                  :class="
                    filterState.statuses.includes(opt.value)
                      ? 'bg-primary-600 border-primary-600'
                      : 'bg-white border-neutral-300'
                  "
                >
                  <CheckCircle
                    v-if="filterState.statuses.includes(opt.value)"
                    :size="10"
                    class="text-white"
                  />
                </div>
                <span class="text-xs font-medium text-neutral-700">{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- Date Range -->
          <div class="space-y-3">
            <h4 class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Date Range
            </h4>
            <div class="space-y-2">
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Calendar :size="12" />
                </span>
                <input
                  v-model="filterState.dateFrom"
                  type="date"
                  class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Calendar :size="12" />
                </span>
                <input
                  v-model="filterState.dateTo"
                  type="date"
                  class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <AppButton
              variant="outline"
              size="sm"
              class="flex-1"
              @click="filterState = { statuses: [], dateFrom: '', dateTo: '' }"
            >
              Reset
            </AppButton>
            <AppButton variant="primary" size="sm" class="flex-1" @click="isFilterOpen = false">
              Apply
            </AppButton>
          </div>
        </template>
      </AppSidePane>

      <!-- Contextual Sidebar (Audit Trail) -->
      <!-- Contextual Sidebar (Audit Trail) -->
      <AppSidePane
        v-model:open="isTraceOpen"
        :title="`Trace: ${traceTarget?.requestNumber}`"
        mode="docked"
        width="320px"
      >
        <template #icon>
          <div class="h-6 w-6 rounded-md bg-primary-50 flex items-center justify-center">
            <History class="h-3.5 w-3.5 text-primary-600" />
          </div>
        </template>

        <div v-if="traceTarget" class="space-y-6">
          <PaymentRequestTimeline :request="traceTarget" density="compact" />

          <!-- Mini Stats -->
          <div class="pt-5 border-t border-neutral-100 space-y-3">
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-neutral-500 font-medium uppercase tracking-tight">Status</span>
              <BadgeCell :status="traceTarget.status" class="scale-90 origin-right" />
            </div>
          </div>
        </div>

        <template #footer>
          <AppButton
            v-if="traceTarget"
            variant="outline"
            size="sm"
            class="w-full h-8 text-[11px]"
            @click="goToDetail(traceTarget)"
          >
            View Full Detail
          </AppButton>
        </template>
      </AppSidePane>
    </div>
  </div>
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
