<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { PageHeader, WorkspacePanel, MetricCard } from '@/shared/components/workspace'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Inbox,
  Plus,
} from 'lucide-vue-next'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import { usePaymentRequests } from '../../../application/composables/usePaymentRequests'
import { usePaymentRequestStats } from '../../../application/composables/usePaymentRequestStats'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { PaymentRequest } from '../../../domain/ap.types'

const router = useRouter()
const { hasPermission } = usePermissions()

const { requests, isLoading: isTableLoading } = usePaymentRequests()
const { stats, isLoading: isStatsLoading } = usePaymentRequestStats()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

const statCards = computed(() => [
  {
    label: 'Submitted',
    value: stats.value?.submittedCount ?? 0,
    description: 'Requests waiting for review before money moves.',
    icon: Clock,
    tone: 'text-[var(--color-warning-700)] bg-[var(--color-warning-50)]',
  },
  {
    label: 'Approved',
    value: stats.value?.approvedCount ?? 0,
    description: 'Requests cleared for payment execution.',
    icon: CheckCircle2,
    tone: 'text-[var(--color-info-700)] bg-[var(--color-info-50)]',
  },
  {
    label: 'Rejected',
    value: stats.value?.rejectedCount ?? 0,
    description: 'Requests that need correction or follow-up.',
    icon: AlertCircle,
    tone: 'text-[var(--color-danger-700)] bg-[var(--color-danger-50)]',
  },
  {
    label: 'Paid',
    value: stats.value?.paidCount ?? 0,
    description: 'Requests fully resolved in the current flow.',
    icon: CreditCard,
    tone: 'text-[var(--color-success-700)] bg-[var(--color-success-50)]',
  },
])

const queueSummary = computed(() => {
  const totalCount = requests.value?.length ?? 0
  const submittedCount = stats.value?.submittedCount ?? 0
  const approvedCount = stats.value?.approvedCount ?? 0

  return [
    `${totalCount} total requests visible`,
    `${submittedCount} awaiting review`,
    `${approvedCount} ready for payout`,
  ]
})

function handleRowClick(pr: PaymentRequest) {
  void router.push({ name: 'PaymentRequestDetail', params: { id: pr.id } })
}

function handleCreate() {
  void router.push({ name: 'PaymentRequestCreate' })
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      dense
      eyebrow="Accounts Payable Workspace"
      title="Payment Requests"
      description="Scan outgoing payment work, identify blocked requests, and move approved items toward settlement."
    >
      <template #icon>
        <Inbox class="h-6 w-6" />
      </template>

      <template #actions>
        <AppButton v-if="hasPermission('ap:create')" variant="primary" @click="handleCreate">
          <template #start>
            <Plus :size="14" />
          </template>
          New Request
        </AppButton>
      </template>
    </PageHeader>

    <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        v-for="card in statCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :description="card.description"
        :loading="isStatsLoading"
      >
        <template #icon>
          <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', card.tone]">
            <component :is="card.icon" class="h-5 w-5" />
          </div>
        </template>
      </MetricCard>
    </section>

    <WorkspacePanel
      dense
      title="Request queue"
      description="This queue is for triage and movement. Click a row to enter focus mode for a specific request."
      body-class="space-y-4"
    >
      <template #icon>
        <Inbox class="h-5 w-5" />
      </template>

      <template #actions>
        <div class="hidden items-center gap-3 text-sm text-[var(--color-neutral-500)] lg:flex">
          <span v-for="item in queueSummary" :key="item">{{ item }}</span>
        </div>
      </template>

      <div
        class="flex flex-wrap items-center gap-3 rounded-xl bg-[var(--color-neutral-50)] px-4 py-2.5"
      >
        <p class="text-[13px] text-[var(--color-neutral-700)]">
          Queue doctrine: review in the workspace, execute on the detail page, trace on demand.
        </p>
        <RouterLink
          v-if="hasPermission('workflows:view')"
          :to="{ name: 'workflows.inbox' }"
          class="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-primary-700)]"
        >
          Open workflow inbox
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </div>

      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :data="requests ?? []"
        :columns="paymentRequestColumns"
        :loading="isTableLoading"
        placeholder="Search payment requests..."
        row-clickable
        @row-click="handleRowClick"
      />
    </WorkspacePanel>
  </div>
</template>
