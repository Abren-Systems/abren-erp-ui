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
import { History, X } from 'lucide-vue-next'
import PaymentRequestTimeline from '../components/PaymentRequestTimeline.vue'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import type { User } from '@/modules/core/domain/user.types'

const router = useRouter()
const { hasPermission } = usePermissions()
const { requests, isLoading } = usePaymentRequests()
const { users } = useUsers()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()
const statusFilter = ref('all')

const isTraceOpen = ref(false)
const traceTarget = ref<PaymentRequest | null>(null)

const selectedCount = computed(() => Object.keys(rowSelection.value).length)

const filteredRequests = computed(() => {
  if (!requests.value) return []
  let data = requests.value

  if (statusFilter.value !== 'all') {
    data = data.filter((r) => r.status === statusFilter.value)
  }

  // Hydrate names
  return data.map((r) => {
    const requester = users.value?.find((u) => u.id === r.requesterId)
    const beneficiary = users.value?.find((u) => u.id === r.beneficiaryId)

    const formatName = (user?: User, id?: string) => {
      if (!user) return id?.slice(0, 8) || 'Unknown'
      return user.email || id?.slice(0, 8)
    }

    return {
      ...r,
      requesterName: formatName(requester, r.requesterId),
      beneficiaryName: formatName(beneficiary, r.beneficiaryId),
    }
  })
})

const statusOptions = [
  { label: 'All', value: 'all' },
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

function handleBulkReject() {
  console.log('Bulk reject:', Object.keys(rowSelection.value))
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
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

              <div v-else class="flex items-center gap-1.5 ml-2">
                <button
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  class="h-7 pl-3 pr-2 flex items-center gap-1.5 text-[11px] font-semibold rounded-full border transition-all"
                  :class="[
                    statusFilter === opt.value
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                  ]"
                  @click="statusFilter = opt.value"
                >
                  <span>{{ opt.label }}</span>
                  <span
                    class="flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] px-1 font-mono transition-colors"
                    :class="[
                      statusFilter === opt.value
                        ? 'bg-neutral-800 text-neutral-300'
                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200',
                    ]"
                  >
                    {{
                      opt.value === 'all'
                        ? requests?.length || 0
                        : requests?.filter((r) => r.status === opt.value).length || 0
                    }}
                  </span>
                </button>
              </div>
            </template>
          </DataGrid>
        </div>
      </div>

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
