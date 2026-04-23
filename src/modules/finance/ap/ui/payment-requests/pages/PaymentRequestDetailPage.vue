<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { AppBadge, AppButton } from '@/shared/components/primitives'
import { PageHeader, WorkspacePanel, MetricCard, WorkspaceTable } from '@/shared/components/workspace'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  FileSpreadsheet,
  History,
  MoreHorizontal,
  Send,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu'
import { usePaymentRequest } from '../../../application/composables/usePaymentRequest'
import { useSubmitPaymentRequest } from '../../../application/composables/useSubmitPaymentRequest'
import { useApprovePaymentRequest } from '../../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../../application/composables/useRejectPaymentRequest'
import { usePayPaymentRequest } from '../../../application/composables/usePayPaymentRequest'
import { usePermissions } from '@/shared/auth/usePermissions'
import PaymentRequestTraceDrawer from '../components/PaymentRequestTraceDrawer.vue'
import PaymentRequestRejectModal from '../components/PaymentRequestRejectModal.vue'
import PaymentRequestPayModal from '../components/PaymentRequestPayModal.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()

const { request, isLoading } = usePaymentRequest(props.id)
const { submit, isPending: isSubmitting } = useSubmitPaymentRequest(props.id)
const { approve, isPending: isApproving } = useApprovePaymentRequest(props.id)
const { reject, isPending: isRejecting } = useRejectPaymentRequest(props.id)
const { pay, isPending: isPaying } = usePayPaymentRequest(props.id)

const isTraceOpen = ref(false)
const isRejectModalOpen = ref(false)
const isPayModalOpen = ref(false)

const isActionPending = computed(
  () => isSubmitting.value || isApproving.value || isRejecting.value || isPaying.value,
)

const statusVariant = computed<'neutral' | 'info' | 'success' | 'danger' | 'primary' | 'warning'>(
  () => {
    switch (request.value?.status) {
      case 'SUBMITTED':
        return 'info'
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'danger'
      case 'PAID':
        return 'primary'
      default:
        return 'neutral'
    }
  },
)

const summaryCards = computed(() => {
  if (!request.value) return []

  return [
    {
      label: 'Total amount',
      value: formatMoney(request.value.totalAmount),
      detail: 'Value requested for disbursement.',
    },
    {
      label: 'Currency',
      value: request.value.currency,
      detail: 'Transaction currency for all request lines.',
    },
    {
      label: 'Approval step',
      value: `Step ${request.value.currentApprovalStep}`,
      detail: 'Current workflow stage before resolution.',
    },
    {
      label: 'Line items',
      value: String(request.value.lines.length),
      detail: 'Line-level breakdown driving the request total.',
    },
  ]
})

const focusGuidance = computed(() => {
  if (!request.value) return 'Review the request details and use trace for provenance when needed.'

  switch (request.value.status) {
    case 'DRAFT':
      return 'Draft requests should be checked for completeness before entering workflow.'
    case 'SUBMITTED':
      return 'Submitted requests need an explicit approval or rejection decision.'
    case 'APPROVED':
      return 'Approved requests are ready for payment execution and final settlement.'
    case 'REJECTED':
      return 'Rejected requests should be traced back to the blocking issue before any retry.'
    case 'PAID':
      return 'Paid requests are resolved, but trace remains available for audit and provenance.'
    default:
      return 'Review the request details and use trace for provenance when needed.'
  }
})

async function handleSubmit() {
  await submit()
}

async function handleApprove() {
  await approve()
}

async function handleReject(reason: string) {
  await reject(reason)
  isRejectModalOpen.value = false
}

async function handlePay(data: { payment_method: string; disbursement_reference: string }) {
  await pay(data)
  isPayModalOpen.value = false
}

function goBack() {
  void router.push({ name: 'PaymentRequestsList' })
}

function formatMoney(money: unknown) {
  const value = money as { format?: (locale?: string) => string } | null
  if (!value?.format) return 'Awaiting amount'
  return value.format('en-ET')
}
</script>

<template>
  <div v-if="isLoading && !request" class="flex min-h-[50vh] items-center justify-center">
    <p class="text-sm text-[var(--color-neutral-500)]">Loading payment request...</p>
  </div>

  <div v-else-if="request" class="space-y-6">
    <PageHeader
      eyebrow="Payment Request Focus"
      title="Review and execute payment request"
      :description="focusGuidance"
    >
      <template #icon>
        <CreditCard class="h-6 w-6" />
      </template>

      <template #actions>
        <AppButton variant="outline" @click="goBack">
          <template #start>
            <ArrowLeft class="h-4 w-4" />
          </template>
          Back to queue
        </AppButton>

        <AppButton variant="outline" @click="isTraceOpen = true">
          <template #start>
            <History class="h-4 w-4" />
          </template>
          Trace
        </AppButton>

        <AppButton
          v-if="request.status === 'DRAFT' && hasPermission('ap:create')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleSubmit"
        >
          <template #start>
            <Send class="h-4 w-4" />
          </template>
          Submit
        </AppButton>

        <AppButton
          v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleApprove"
        >
          <template #start>
            <CheckCircle class="h-4 w-4" />
          </template>
          Approve
        </AppButton>

        <AppButton
          v-if="request.status === 'APPROVED' && hasPermission('ap:post')"
          variant="primary"
          :disabled="isActionPending"
          @click="isPayModalOpen = true"
        >
          Mark as Paid
        </AppButton>

        <DropdownMenu v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')">
          <DropdownMenuTrigger as-child>
            <AppButton variant="stealth">
              <template #start>
                <MoreHorizontal class="h-4 w-4" />
              </template>
            </AppButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-[var(--color-danger-700)]"
              @click="isRejectModalOpen = true"
            >
              Reject request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>
    </PageHeader>

    <div
      class="flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--color-neutral-50)] px-4 py-3"
    >
      <AppBadge :variant="statusVariant">{{ request.status }}</AppBadge>
      <p class="font-mono text-sm text-[var(--color-neutral-500)]">{{ request.id }}</p>
      <p class="text-sm text-[var(--color-neutral-600)]">
        Keep decisions explicit. Use trace when you need source, workflow, or impact context.
      </p>
    </div>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        v-for="card in summaryCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :description="card.detail"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <WorkspacePanel
        title="Request context"
        description="The why behind the request should be readable before any state-changing action."
      >
        <template #icon>
          <AlertTriangle class="h-5 w-5" />
        </template>

        <div class="space-y-5">
          <div>
            <p
              class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-neutral-500)]"
            >
              Justification
            </p>
            <p class="mt-3 text-sm leading-7 text-[var(--color-neutral-700)]">
              {{ request.justification }}
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl bg-[var(--color-neutral-50)] p-4">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-neutral-500)]"
              >
                Beneficiary
              </p>
              <p class="mt-2 font-mono text-xs text-[var(--color-neutral-700)]">
                {{ request.beneficiaryId }}
              </p>
            </div>
            <div class="rounded-xl bg-[var(--color-neutral-50)] p-4">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-neutral-500)]"
              >
                Requester
              </p>
              <p class="mt-2 font-mono text-xs text-[var(--color-neutral-700)]">
                {{ request.requesterId }}
              </p>
            </div>
          </div>

          <RouterLink
            :to="{ name: 'PaymentRequestsList' }"
            class="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary-700)]"
          >
            Return to request workspace
            <ArrowLeft class="h-4 w-4" />
          </RouterLink>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Line breakdown"
        description="Use the line-level breakdown to verify account mapping, categories, and final amount."
        body-class="space-y-4"
      >
        <template #icon>
          <FileSpreadsheet class="h-5 w-5" />
        </template>

        <WorkspaceTable>
          <template #header>
            <tr>
              <th>Description</th>
              <th class="text-right">Amount</th>
              <th>GL Account</th>
              <th>Category</th>
            </tr>
          </template>
          <template #body>
            <tr v-for="line in request.lines" :key="line.id">
              <td class="text-[var(--color-neutral-700)]">{{ line.description }}</td>
              <td class="text-right font-semibold text-[var(--color-neutral-900)]">
                {{ formatMoney(line.amount) }}
              </td>
              <td class="font-mono text-[11px] text-[var(--color-neutral-500)]">
                {{ line.accountId ?? '—' }}
              </td>
              <td class="font-mono text-[11px] text-[var(--color-neutral-500)]">
                {{ line.categoryId ?? '—' }}
              </td>
            </tr>
          </template>
          <template #footer>
            <tr class="font-semibold">
              <td class="text-[var(--color-neutral-600)]">Total</td>
              <td class="text-right text-[var(--color-neutral-900)]">
                {{ formatMoney(request.totalAmount) }}
              </td>
              <td colspan="2" />
            </tr>
          </template>
        </WorkspaceTable>
      </WorkspacePanel>
    </section>

    <PaymentRequestTraceDrawer v-model:open="isTraceOpen" :request="request" />
    <PaymentRequestRejectModal
      v-model:open="isRejectModalOpen"
      :is-pending="isRejecting"
      @confirm="handleReject"
    />
    <PaymentRequestPayModal
      v-model:open="isPayModalOpen"
      :is-pending="isPaying"
      @confirm="handlePay"
    />
  </div>
</template>
