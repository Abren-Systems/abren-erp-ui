<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppInput, AppSidePane, AppDialog } from '@/shared/components/primitives'
import { PageHeader } from '@/shared/components/workspace'
import {
  History,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Edit3,
  Send,
} from 'lucide-vue-next'
import { usePaymentRequest } from '../../../application/composables/usePaymentRequest'
import { useApprovePaymentRequest } from '../../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../../application/composables/useRejectPaymentRequest'
import { useAuthorizePaymentRequest } from '../../../application/composables/useAuthorizePaymentRequest'
import { useCancelPaymentRequest } from '../../../application/composables/useCancelPaymentRequest'
import { usePermissions } from '@/shared/auth/usePermissions'
import { Money } from '@/shared/domain/money'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import PaymentRequestTimeline from '../components/PaymentRequestTimeline.vue'
import BadgeCell from '@/shared/components/data-grid/cells/BadgeCell.vue'
import { useUsers } from '@/modules/core/application/composables/useUsers'
import { useMoney } from '@/shared/composables/useMoney'
import { BusinessDate } from '@/shared/domain/business-date'

const props = defineProps<{ id: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()
const { users } = useUsers()
const { formatMoney } = useMoney()

const { request, isLoading } = usePaymentRequest(props.id as PaymentRequestId)

const requesterName = computed(() => {
  if (!request.value) return '…'
  const user = users.value?.find((u) => u.id === request.value?.requesterId)
  if (!user) return request.value.requesterId.slice(0, 8)
  return user.email || request.value.requesterId.slice(0, 8)
})

const beneficiaryName = computed(() => {
  if (!request.value) return '…'
  const user = users.value?.find((u) => u.id === request.value?.beneficiaryId)
  if (!user) return request.value.beneficiaryId.slice(0, 8)
  return user.email || request.value.beneficiaryId.slice(0, 8)
})

const { approve, isPending: isApproving } = useApprovePaymentRequest(props.id as PaymentRequestId)
const { reject, isPending: isRejecting } = useRejectPaymentRequest(props.id as PaymentRequestId)
const { authorize, isPending: isAuthorizing } = useAuthorizePaymentRequest(
  props.id as PaymentRequestId,
)
const { cancel, isPending: isCancelling } = useCancelPaymentRequest(props.id as PaymentRequestId)

const approveOpen = ref(false)
const rejectOpen = ref(false)
const authorizeOpen = ref(false)
const cancelOpen = ref(false)
const rejectReason = ref('')
const cancelReason = ref('')

async function confirmApprove() {
  await approve()
  approveOpen.value = false
}

async function confirmReject() {
  await reject(rejectReason.value)
  rejectOpen.value = false
}

async function confirmAuthorize() {
  await authorize()
  authorizeOpen.value = false
}

async function confirmCancel() {
  await cancel(cancelReason.value)
  cancelOpen.value = false
}

function goBack() {
  void router.push({ name: 'PaymentRequestsList' })
}
</script>

<template>
  <div v-if="isLoading && !request" class="flex h-[400px] items-center justify-center">
    <div class="text-sm text-neutral-500 animate-pulse">Loading request details...</div>
  </div>

  <div v-else-if="request" class="space-y-6">
    <PageHeader
      :title="`${request.requestNumber} | ${request.beneficiaryId.slice(0, 8)}`"
      description="Financial Payment Request Workflow"
    >
      <template #start>
        <AppButton variant="stealth" size="sm" class="h-8 w-8 p-0" @click="goBack">
          <ArrowLeft :size="16" />
        </AppButton>
      </template>

      <template #actions>
        <div class="flex items-center gap-2">
          <div class="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 mr-2">
            <AppButton variant="stealth" size="sm" class="h-7 w-7 p-0" disabled>
              <ChevronLeft :size="14" />
            </AppButton>
            <div class="h-3 w-px bg-neutral-200 mx-1" />
            <AppButton variant="stealth" size="sm" class="h-7 w-7 p-0" disabled>
              <ChevronRight :size="14" />
            </AppButton>
          </div>

          <AppButton
            v-if="
              (request.status === 'DRAFT' || request.status === 'SUBMITTED') &&
              hasPermission('ap:edit')
            "
            variant="stealth"
            size="sm"
            class="text-neutral-500 hover:bg-neutral-100"
            @click="cancelOpen = true"
          >
            <template #start><XCircle :size="14" /></template>
            Cancel
          </AppButton>

          <AppButton
            v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')"
            variant="stealth"
            size="sm"
            class="text-red-600 hover:bg-red-50 hover:text-red-700"
            @click="rejectOpen = true"
          >
            <template #start><XCircle :size="14" /></template>
            Reject
          </AppButton>

          <!-- Action: Edit (for DRAFT or REJECTED) -->
          <AppButton
            v-if="request.status === 'DRAFT' || request.status === 'REJECTED'"
            variant="outline"
            size="sm"
            @click="router.push({ name: 'PaymentRequestEdit', params: { id: request.id } })"
          >
            <template #start><Edit3 :size="14" /></template>
            Edit Request
          </AppButton>

          <AppButton
            v-if="request.status === 'DRAFT' || request.status === 'REJECTED'"
            variant="primary"
            size="sm"
            @click="approveOpen = true"
          >
            <template #start><Send :size="14" /></template>
            Submit for Approval
          </AppButton>

          <AppButton
            v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')"
            variant="primary"
            size="sm"
            @click="approveOpen = true"
          >
            <template #start><CheckCircle :size="14" /></template>
            Approve
          </AppButton>

          <AppButton
            v-if="request.status === 'APPROVED' && hasPermission('ap:post')"
            variant="primary"
            size="sm"
            @click="authorizeOpen = true"
          >
            <template #start><CheckCircle :size="14" /></template>
            Authorize Payment
          </AppButton>
        </div>
      </template>
    </PageHeader>

    <!-- Metadata Ribbon -->
    <div
      class="flex items-center gap-8 rounded-xl border border-neutral-200 bg-neutral-50/50 px-6 py-3 shadow-sm"
    >
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400"
          >Total Amount</span
        >
        <span class="text-sm font-semibold text-neutral-900">{{
          formatMoney(request.totalAmount)
        }}</span>
      </div>
      <div class="h-8 w-px bg-neutral-200" />
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400"
          >Request Date</span
        >
        <span class="text-sm font-semibold text-neutral-900">{{
          request.submittedAt ? BusinessDate.format(request.submittedAt) : 'Pending'
        }}</span>
      </div>
      <div class="h-8 w-px bg-neutral-200" />
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</span>
        <div class="flex items-center gap-1.5">
          <div
            :class="[
              'h-1.5 w-1.5 rounded-full',
              request.status === 'SUBMITTED' ? 'bg-warning-500' : '',
              request.status === 'APPROVED' ? 'bg-info-500' : '',
              request.status === 'AUTHORIZED' ? 'bg-success-500' : '',
              request.status === 'REJECTED' ? 'bg-danger-500' : '',
              request.status === 'CANCELLED' ? 'bg-neutral-600' : '',
              request.status === 'DRAFT' ? 'bg-neutral-400' : '',
            ]"
          />
          <span class="text-sm font-semibold text-neutral-900">{{ request.status }}</span>
        </div>
      </div>
      <div class="h-8 w-px bg-neutral-200" />
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400"
          >Beneficiary</span
        >
        <span class="text-sm font-semibold text-neutral-900">{{ beneficiaryName }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 items-start">
      <!-- Main Content (Left Column) -->
      <div class="lg:col-span-9 space-y-8">
        <!-- Section 1: Core Fields (Flat Grid) -->
        <div class="grid grid-cols-2 gap-x-12 gap-y-8">
          <div class="space-y-6">
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                >Requester</label
              >
              <div class="text-sm font-medium text-neutral-900">
                {{ requesterName }}
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                >Justification</label
              >
              <p class="text-sm text-neutral-600 leading-relaxed">
                {{ request.justification }}
              </p>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                >Currency</label
              >
              <div class="text-sm font-medium text-neutral-900">{{ request.currency }}</div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                >Origin Document</label
              >
              <div class="text-sm font-medium text-neutral-900">
                {{ request.sourceModule || 'Manual Entry' }}
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                >Source Reference</label
              >
              <div class="text-sm font-medium text-neutral-900 font-mono">
                {{ request.sourceId || 'N/A' }}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                >Requested By</label
              >
              <div
                class="flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-200 bg-white"
              >
                <div
                  class="h-6 w-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] text-white font-bold"
                >
                  {{ requesterName.slice(0, 2).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-neutral-900">{{ requesterName }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
                  >Request Date</label
                >
                <div class="text-sm font-medium text-neutral-900">
                  {{ request.submittedAt || '—' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="h-px bg-neutral-200" />

        <div class="space-y-2">
          <label class="text-[11px] font-bold uppercase tracking-wider text-neutral-400"
            >Description / Memo</label
          >
          <p
            class="text-sm text-neutral-900 leading-relaxed bg-neutral-50/50 p-4 rounded-lg border border-neutral-100"
          >
            {{ request.justification || 'No justification provided.' }}
          </p>
        </div>

        <!-- Section 2: Supporting Detail (Conditional) -->
        <div v-if="request.lines && request.lines.length > 0" class="space-y-4">
          <h3 class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Line Items
          </h3>
          <div class="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
            <table class="w-full text-sm">
              <thead
                class="bg-neutral-50/50 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200"
              >
                <tr>
                  <th class="px-6 py-3 text-left w-12">#</th>
                  <th class="px-6 py-3 text-left">Item Description</th>
                  <th class="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr
                  v-for="(line, idx) in request.lines"
                  :key="line.id"
                  class="hover:bg-neutral-50/30 transition-colors"
                >
                  <td class="px-6 py-3 text-neutral-400 font-mono text-xs">{{ idx + 1 }}</td>
                  <td class="px-6 py-3 font-medium text-neutral-900">{{ line.description }}</td>
                  <td class="px-6 py-3 text-right font-mono text-neutral-900">
                    {{ formatMoney(line.amount) }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-neutral-50/50 font-bold border-t border-neutral-200">
                <tr>
                  <td
                    colspan="2"
                    class="px-6 py-4 text-right text-[10px] uppercase text-neutral-500"
                  >
                    Grand Total
                  </td>
                  <td class="px-6 py-4 text-right text-base text-neutral-900 tabular-nums">
                    {{ formatMoney(request.totalAmount) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Linked Source Documents -->
        <div v-if="request.sourceId" class="space-y-4">
          <h3 class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Provenance & Relationships
          </h3>
          <div
            class="group flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
            @click="
              request.sourceModule === 'VENDOR_BILL' &&
              router.push({ name: 'VendorBillDetail', params: { id: request.sourceId } })
            "
          >
            <div class="flex items-center gap-4">
              <div
                class="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white"
              >
                <FileText :size="20" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-neutral-900">Origin Document</span>
                  <BadgeCell
                    :status="request.sourceModule || 'INTERNAL'"
                    class="scale-75 origin-left"
                  />
                </div>
                <p class="text-xs text-neutral-500 mt-0.5">
                  ID: {{ request.sourceId }} • Source: {{ request.sourceModule }}
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-2 text-primary-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
            >
              <span class="text-[10px] font-bold uppercase">View Original</span>
              <ChevronRight :size="14" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: Audit Trail (Right Column) -->
      <aside class="lg:col-span-3 space-y-6 sticky top-24">
        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <PaymentRequestTimeline :request="request" density="compact" />
        </div>
      </aside>
    </div>

    <!-- Approve Dialog -->
    <AppDialog v-model:open="approveOpen" title="Confirm Approval" size="sm">
      <p class="text-sm text-neutral-600">
        You are about to approve this payment request. This action will advance the workflow to the
        next stage.
      </p>
      <template #footer>
        <AppButton variant="outline" @click="approveOpen = false">Cancel</AppButton>
        <AppButton variant="primary" :loading="isApproving" @click="confirmApprove"
          >Confirm Approval</AppButton
        >
      </template>
    </AppDialog>

    <!-- Reject Dialog -->
    <AppDialog v-model:open="rejectOpen" title="Reject Request" size="sm">
      <div class="space-y-4">
        <p class="text-sm text-neutral-600">Please provide a reason for rejecting this request.</p>
        <AppInput v-model="rejectReason" placeholder="Reason for rejection..." />
      </div>
      <template #footer>
        <AppButton variant="outline" @click="rejectOpen = false">Cancel</AppButton>
        <AppButton
          variant="primary"
          class="bg-danger-600 hover:bg-danger-700"
          :loading="isRejecting"
          @click="confirmReject"
          >Reject Request</AppButton
        >
      </template>
    </AppDialog>

    <!-- Authorize Dialog -->
    <AppDialog v-model:open="authorizeOpen" title="Confirm Authorization" size="sm">
      <p class="text-sm text-neutral-600">
        You are about to authorize this payment request for disbursement. This action is final and
        cleared for accounting.
      </p>
      <template #footer>
        <AppButton variant="outline" @click="authorizeOpen = false">Back</AppButton>
        <AppButton variant="primary" :loading="isAuthorizing" @click="confirmAuthorize"
          >Authorize Now</AppButton
        >
      </template>
    </AppDialog>

    <!-- Cancel Dialog -->
    <AppDialog v-model:open="cancelOpen" title="Cancel Request" size="sm">
      <div class="space-y-4">
        <p class="text-sm text-neutral-600">
          Are you sure you want to cancel this request? This action cannot be undone.
        </p>
        <AppInput v-model="cancelReason" placeholder="Reason for cancellation..." />
      </div>
      <template #footer>
        <AppButton variant="outline" @click="cancelOpen = false">Keep Request</AppButton>
        <AppButton
          variant="primary"
          class="bg-danger-600 hover:bg-danger-700"
          :loading="isCancelling"
          @click="confirmCancel"
          >Cancel Permanently</AppButton
        >
      </template>
    </AppDialog>
  </div>
</template>
