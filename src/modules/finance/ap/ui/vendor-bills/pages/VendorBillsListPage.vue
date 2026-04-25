<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import type { Row } from '@tanstack/vue-table'
import { AppButton, AppSidePane } from '@/shared/components/primitives'
import { PageHeader, MetricCard } from '@/shared/components/workspace'
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

const stats = computed(() => {
  const data = bills.value ?? []
  return {
    total: data.length,
    draft: data.filter((b) => b.status === 'DRAFT').length,
    validated: data.filter((b) => b.status === 'VALIDATED').length,
  }
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
  <div class="flex h-full flex-col bg-neutral-50/50">
    <PageHeader
      title="Vendor Bills"
      description="Supplier invoice intake, validation, and accrual workflow."
    >
      <template #actions>
        <AppButton v-if="hasPermission('ap:create')" variant="primary" @click="handleCreate">
          <Plus :size="16" class="mr-2" />
          Register Bill
        </AppButton>
      </template>
    </PageHeader>

    <div class="flex-1 overflow-hidden flex">
      <div class="flex-1 flex flex-col min-w-0 p-6 space-y-6 overflow-y-auto scrollbar-thin">
        <!-- Metrics -->
        <div class="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Total Intake"
            :value="stats.total"
            description="Total supplier invoices in workflow"
          >
            <template #icon><Receipt class="h-4 w-4 text-neutral-400" /></template>
          </MetricCard>
          <MetricCard
            label="Draft Registry"
            :value="stats.draft"
            description="Awaiting validation and review"
          >
            <template #icon><FileText class="h-4 w-4 text-warning-500" /></template>
          </MetricCard>
          <MetricCard
            label="Ready for Accrual"
            :value="stats.validated"
            description="Validated and ready for downstream"
          >
            <template #icon><Plus class="h-4 w-4 text-success-500" /></template>
          </MetricCard>
        </div>

        <!-- Workboard Grid -->
        <div
          class="flex-1 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
        >
          <div class="p-4 border-b border-neutral-100 flex items-center justify-between bg-white">
            <h3 class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Intake Queue
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-neutral-500 font-medium">Auto-refresh active</span>
              <div class="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse"></div>
            </div>
          </div>

          <DataGrid
            v-model:sorting="sorting"
            v-model:row-selection="rowSelection"
            v-model:column-visibility="columnVisibility"
            v-model:global-filter="globalFilter"
            :data="bills ?? []"
            :columns="columns"
            :loading="isLoading"
            placeholder="Search bills by number or vendor..."
            row-clickable
            class="flex-1"
            @row-click="handleRowClick"
          />
        </div>
      </div>

      <!-- Contextual SidePane (Audit Trace) -->
      <AppSidePane
        v-model:open="isTraceOpen"
        :title="`Trace: ${traceTarget?.billNumber}`"
        description="Audit provenance and status history"
        mode="docked"
        width="320px"
      >
        <template #icon>
          <History :size="16" class="text-primary-600" />
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
    </div>
  </div>
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
