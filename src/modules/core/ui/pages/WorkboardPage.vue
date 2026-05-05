<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ArrowRight, LayoutDashboard } from 'lucide-vue-next'
import { useAuditStore } from '@/shared/infrastructure/audit.store'
import { useAuthStore } from '@/shared/auth/auth.store'
import { PageHeader } from '@/shared/components/workspace'
import { useUsers } from '../../application/useUsers'
import { usePendingApprovals } from '@/modules/workflows/application/usePendingApprovals'
import { usePaymentRequestStats } from '@/modules/finance/ap/application/usePaymentRequestStats'

// Sub-components
import WorkboardStats from '../workboard/components/WorkboardStats.vue'
import AttentionQueue from '../workboard/components/AttentionQueue.vue'
import FlowHealth from '../workboard/components/FlowHealth.vue'
import OperationalTrace from '../workboard/components/OperationalTrace.vue'
import QuickLinks from '../workboard/components/QuickLinks.vue'

const authStore = useAuthStore()
const auditStore = useAuditStore()
const { activityLog, totalLogs } = storeToRefs(auditStore)

const { users } = useUsers()
const { tasks, isLoading: isLoadingTasks } = usePendingApprovals()
const { stats, isLoading: isLoadingStats } = usePaymentRequestStats()

const activeUsersCount = computed(() => users.value?.length ?? 0)
const tenantName = computed(() => authStore.currentTenant?.name ?? 'Current tenant')

const priorityItems = computed(() =>
  (tasks.value ?? []).slice(0, 5).map((task) => ({
    id: task.id,
    title: `${task.entityType.replace(/_/g, ' ')} approval`,
    subtitle: task.targetState
      ? `Move ${task.currentState} to ${task.targetState}`
      : `Currently in ${task.currentState}`,
    submittedAt: formatDate(task.submittedAt),
  })),
)

const recentEvents = computed(() =>
  activityLog.value.slice(0, 6).map((event) => ({
    id: event.metadata.id,
    title: formatEventTitle(event.type),
    sourceModule: event.metadata.sourceModule,
    timestamp: formatDate(event.metadata.timestamp),
  })),
)

const quickLinks = [
  {
    title: 'Workflow Inbox',
    description: 'Process approvals and unblock waiting work.',
    to: { name: 'workflows.inbox' },
  },
  {
    title: 'Payment Requests',
    description: 'Review requests moving through the finance pipeline.',
    to: { name: 'PaymentRequestsList' },
  },
  {
    title: 'Vendor Bills',
    description: 'Validate bill intake and source document coverage.',
    to: { name: 'VendorBillsList' },
  },
  {
    title: 'Chart of Accounts',
    description: 'Maintain the ledger structure and accounting controls.',
    to: { name: 'LedgerCoa' },
  },
]

function formatEventTitle(eventName: string): string {
  const [entity, action] = eventName.split(':')
  const formattedEntity = entity
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return action ? `${formattedEntity} ${action.replace(/-/g, ' ')}` : formattedEntity
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Awaiting timestamp'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Awaiting timestamp'

  return new Intl.DateTimeFormat('en-ET', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      eyebrow="Workboard"
      title="Operational finance at a glance"
      :description="`Focus ${tenantName} on what needs action now, what is blocked, and what changed recently.`"
    >
      <template #icon>
        <LayoutDashboard class="h-6 w-6" />
      </template>

      <template #actions>
        <RouterLink
          :to="{ name: 'workflows.inbox' }"
          class="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-neutral-900)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition-transform hover:-translate-y-0.5"
        >
          Open Inbox
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </template>
    </PageHeader>

    <WorkboardStats
      :is-loading-tasks="isLoadingTasks"
      :is-loading-stats="isLoadingStats"
      :pending-approvals-count="tasks?.length ?? 0"
      :submitted-requests-count="stats?.submittedCount ?? 0"
      :total-operational-amount="stats?.totalAmount.format('en-ET') ?? '...'"
      :active-users-count="activeUsersCount"
    />

    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <AttentionQueue :items="priorityItems" />
      <FlowHealth
        :is-loading-stats="isLoadingStats"
        :approved-requests-count="stats?.approvedCount ?? 0"
        :paid-requests-count="stats?.paidCount ?? 0"
        :rejected-requests-count="stats?.rejectedCount ?? 0"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <OperationalTrace :total-logs="totalLogs" :events="recentEvents" />
      <QuickLinks :links="quickLinks" />
    </section>
  </div>
</template>
