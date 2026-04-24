<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppInput, AppDrawer, AppDialog } from '@/shared/components/primitives'
import { PageHeader } from '@/shared/components/workspace'
import {
  History,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-vue-next'
import { usePaymentRequest } from '../../../application/composables/usePaymentRequest'
import { useApprovePaymentRequest } from '../../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../../application/composables/useRejectPaymentRequest'
import { usePermissions } from '@/shared/auth/usePermissions'
import { Money } from '@/shared/domain/money'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import PaymentRequestTimeline from '../components/PaymentRequestTimeline.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()

const { request, isLoading } = usePaymentRequest(props.id as PaymentRequestId)
const { approve, isPending: isApproving } = useApprovePaymentRequest(props.id as PaymentRequestId)
const { reject, isPending: isRejecting } = useRejectPaymentRequest(props.id as PaymentRequestId)

const approveOpen = ref(false)
const rejectOpen = ref(false)
const rejectReason = ref('')

async function confirmApprove() {
  await approve()
  approveOpen.value = false
}

async function confirmReject() {
  await reject(rejectReason.value)
  rejectOpen.value = false
}

function goBack() {
  void router.push({ name: 'PaymentRequestsList' })
}

function formatMoney(money: unknown) {
  if (!money || !(money instanceof Money)) return '—'
  return money.format('en-ET')
}
</script>

<template>
  <div v-if="isLoading && !request" class="flex h-[400px] items-center justify-center">
    <div class="text-sm text-neutral-500 animate-pulse">Loading request details...</div>
  </div>

  <div v-else-if="request" class="space-y-6">
    <PageHeader
      :title="`${request.id.slice(0, 8).toUpperCase()} | ${request.beneficiaryId.slice(0, 8)}`"
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
            v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')"
            variant="stealth"
            size="sm"
            class="text-red-600 hover:bg-red-50 hover:text-red-700"
            @click="rejectOpen = true"
          >
            <template #start><XCircle :size="14" /></template>
            Reject
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
        <span class="text-sm font-semibold text-neutral-900"
          >{{ formatMoney(request.totalAmount) }} {{ request.currency }}</span
        >
      </div>
      <div class="h-8 w-px bg-neutral-200" />
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</span>
        <div class="flex items-center gap-1.5">
          <div
            :class="[
              'h-1.5 w-1.5 rounded-full',
              request.status === 'SUBMITTED' ? 'bg-warning-500' : 'bg-success-500',
            ]"
          />
          <span class="text-sm font-semibold text-neutral-900">{{ request.status }}</span>
        </div>
      </div>
      <div class="h-8 w-px bg-neutral-200" />
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-neutral-400"
          >Vendor ID</span
        >
        <span class="text-sm font-semibold text-neutral-900 font-mono">{{
          request.beneficiaryId.slice(0, 12)
        }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 items-start">
      <!-- Main Content (Left Column) -->
      <div class="lg:col-span-9 space-y-8">
        <!-- Section 1: Core Fields (Flat Grid) -->
        <div class="grid grid-cols-2 gap-x-12 gap-y-6">
          <div class="space-y-6">
            <AppInput label="Vendor" :modelValue="request.beneficiaryId" readonly />
            <AppInput label="Invoice Number" :modelValue="request.sourceId || 'N/A'" readonly />
            <div class="grid grid-cols-2 gap-4">
              <AppInput label="Amount" :modelValue="formatMoney(request.totalAmount)" readonly />
              <AppInput label="Currency" :modelValue="request.currency" readonly />
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
                  {{ request.requesterId.slice(0, 2).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-neutral-900">{{
                  request.requesterId.slice(0, 8)
                }}</span>
                <span class="text-xs text-neutral-500">(IT Operations)</span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <AppInput label="Request Date" :modelValue="request.submittedAt || '—'" readonly />
              <AppInput label="Due Date" modelValue="2023-11-23" readonly />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <AppInput label="Department" modelValue="Engineering" readonly />
              <AppInput label="Cost Center" modelValue="CC-882-ENG" readonly />
            </div>
          </div>
        </div>

        <div class="h-px bg-neutral-200" />

        <div class="space-y-4">
          <AppInput
            label="Description / Memo"
            :modelValue="request.justification || 'No justification provided.'"
            readonly
          />
        </div>

        <!-- Section 2: Supporting Detail (Conditional) -->
        <div v-if="request.lines && request.lines.length > 0" class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">Line Items</h3>
          <div class="rounded-lg border border-neutral-200 overflow-hidden bg-white shadow-sm">
            <table class="w-100 w-full text-sm">
              <thead
                class="bg-neutral-50 text-[11px] font-bold uppercase text-neutral-500 border-b border-neutral-200"
              >
                <tr>
                  <th class="px-4 py-2 text-left w-12">#</th>
                  <th class="px-4 py-2 text-left">Item Description</th>
                  <th class="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr
                  v-for="(line, idx) in request.lines"
                  :key="line.id"
                  class="hover:bg-neutral-50 transition-colors"
                >
                  <td class="px-4 py-2.5 text-neutral-400 font-mono text-xs">{{ idx + 1 }}</td>
                  <td class="px-4 py-2.5 font-medium">{{ line.description }}</td>
                  <td class="px-4 py-2.5 text-right font-mono">{{ formatMoney(line.amount) }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-neutral-50/50 font-semibold border-t border-neutral-200">
                <tr>
                  <td colspan="2" class="px-4 py-3 text-right text-neutral-500">Total Amount</td>
                  <td class="px-4 py-3 text-right text-lg text-neutral-900">
                    {{ formatMoney(request.totalAmount) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Linked Source Documents -->
        <div v-else-if="request.sourceModule" class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Linked Source Documents
          </h3>
          <div
            class="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-primary-300 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <div
                class="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600"
              >
                <FileText :size="20" />
              </div>
              <div>
                <div
                  class="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors"
                >
                  Vendor Bill: {{ request.sourceId }}
                </div>
                <div class="text-xs text-neutral-500">
                  Lines and accounting details are managed on the source document.
                </div>
              </div>
            </div>
            <AppButton variant="stealth" size="sm">View Bill</AppButton>
          </div>
        </div>
      </div>

      <!-- Sidebar: Audit Trail (Right Column) -->
      <aside class="lg:col-span-3 space-y-6 sticky top-24">
        <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <PaymentRequestTimeline :request="request" density="compact" />

          <div class="mt-8 pt-6 border-t border-neutral-100">
            <AppButton
              variant="stealth"
              size="sm"
              class="w-full justify-start text-xs text-neutral-400 italic"
            >
              View full audit history...
            </AppButton>
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
          <h4 class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
            System Context
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-[11px] text-neutral-500">Approval Step</span>
              <span class="text-[11px] font-bold text-neutral-900"
                >Step {{ request.currentApprovalStep }} of 3</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[11px] text-neutral-500">Owner Module</span>
              <span class="text-[11px] font-bold text-neutral-900">Accounts Payable</span>
            </div>
          </div>
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
  </div>
</template>
