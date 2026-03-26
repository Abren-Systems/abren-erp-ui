<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/core/ui/button'
import { Badge } from '@/core/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/ui/card'
import { usePaymentRequest } from '../../application/composables/usePaymentRequest'
import { useSubmitPaymentRequest } from '../../application/composables/useSubmitPaymentRequest'
import { useApprovePaymentRequest } from '../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../application/composables/useRejectPaymentRequest'
import { usePayPaymentRequest } from '../../application/composables/usePayPaymentRequest'

const props = defineProps<{ id: string }>()
const router = useRouter()

const { request, isLoading } = usePaymentRequest(props.id)

const { mutateAsync: submit, isPending: isSubmitting } = useSubmitPaymentRequest()
const { mutateAsync: approve, isPending: isApproving } = useApprovePaymentRequest()
const { mutateAsync: reject, isPending: isRejecting } = useRejectPaymentRequest()
const { mutateAsync: pay, isPending: isPaying } = usePayPaymentRequest()

// Reject modal state
const showRejectModal = ref(false)
const rejectReason = ref('')

// Pay form state
const showPayForm = ref(false)
const paymentMethod = ref('BANK_TRANSFER')
const disbursementReference = ref('')

const isActionPending = computed(
  () => isSubmitting.value || isApproving.value || isRejecting.value || isPaying.value,
)

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  SUBMITTED: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  PAID: 'default',
}

async function handleSubmit() {
  if (confirm('Submit this request for approval?')) {
    await submit(props.id)
  }
}

async function handleApprove() {
  if (confirm('Approve this payment request?')) {
    await approve(props.id)
  }
}

async function handleReject() {
  if (!rejectReason.value.trim()) return
  await reject({ id: props.id, reason: rejectReason.value })
  showRejectModal.value = false
  rejectReason.value = ''
}

async function handlePay() {
  if (!paymentMethod.value || !disbursementReference.value.trim()) return
  await pay({
    id: props.id,
    paymentMethod: paymentMethod.value,
    disbursementReference: disbursementReference.value,
  })
  showPayForm.value = false
}
</script>

<template>
  <div class="p-6 space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <button
          class="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1 mb-1"
          @click="router.push({ name: 'PaymentRequestsList' })"
        >
          ← Back to Requests
        </button>
        <h1 class="text-2xl font-bold tracking-tight">Payment Request</h1>
        <code class="text-xs text-neutral-400 font-mono">{{ id }}</code>
      </div>
      <Badge v-if="request" :variant="STATUS_VARIANT[request.status]">
        {{ request.status }}
      </Badge>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-neutral-500 text-sm py-12 text-center">Loading…</div>

    <template v-else-if="request">
      <!-- Metadata -->
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-neutral-500">Beneficiary</dt>
              <dd class="font-medium font-mono text-xs">{{ request.beneficiaryId }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Total Amount</dt>
              <dd class="font-bold text-lg">{{ request.totalAmount.format() }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Currency</dt>
              <dd>{{ request.currency }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Approval Step</dt>
              <dd>Step {{ request.currentApprovalStep }}</dd>
            </div>
            <div class="col-span-2">
              <dt class="text-neutral-500">Justification</dt>
              <dd class="mt-1 text-neutral-900">{{ request.justification }}</dd>
            </div>
            <div v-if="request.submittedAt">
              <dt class="text-neutral-500">Submitted</dt>
              <dd>{{ request.submittedAt.toLocaleDateString('en-ET') }}</dd>
            </div>
            <div v-if="request.paidAt">
              <dt class="text-neutral-500">Paid</dt>
              <dd>{{ request.paidAt.toLocaleDateString('en-ET') }}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <!-- Line Items -->
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>{{ request.lines.length }} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-neutral-200">
                <th class="text-left py-2 text-neutral-500 font-medium">Description</th>
                <th class="text-right py-2 text-neutral-500 font-medium">Amount</th>
                <th class="text-left py-2 text-neutral-500 font-medium pl-4">GL Account</th>
                <th class="text-left py-2 text-neutral-500 font-medium pl-4">Category</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in request.lines"
                :key="line.id"
                class="border-b border-neutral-100 last:border-0"
              >
                <td class="py-2">{{ line.description }}</td>
                <td class="py-2 text-right font-mono font-semibold">{{ line.amount.format() }}</td>
                <td class="py-2 pl-4">
                  <code v-if="line.accountId" class="text-xs text-neutral-400">{{
                    line.accountId.slice(0, 8)
                  }}</code>
                  <span v-else class="text-neutral-300 text-xs">—</span>
                </td>
                <td class="py-2 pl-4">
                  <code v-if="line.categoryId" class="text-xs text-neutral-400">{{
                    line.categoryId.slice(0, 8)
                  }}</code>
                  <span v-else class="text-neutral-300 text-xs">—</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-neutral-200">
                <td class="py-2 font-semibold">Total</td>
                <td class="py-2 text-right font-bold font-mono">
                  {{ request.totalAmount.format() }}
                </td>
                <td colspan="2" />
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      <!-- Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-3">
          <!-- DRAFT → Submit -->
          <Button
            v-if="request.status === 'DRAFT'"
            variant="default"
            :disabled="isActionPending"
            @click="handleSubmit"
          >
            Submit for Approval
          </Button>

          <!-- SUBMITTED → Approve / Reject -->
          <template v-if="request.status === 'SUBMITTED'">
            <Button variant="default" :disabled="isActionPending" @click="handleApprove">
              Approve
            </Button>
            <Button
              variant="destructive"
              :disabled="isActionPending"
              @click="showRejectModal = true"
            >
              Reject
            </Button>
          </template>

          <!-- APPROVED → Pay -->
          <Button
            v-if="request.status === 'APPROVED'"
            variant="default"
            :disabled="isActionPending"
            @click="showPayForm = true"
          >
            Mark as Paid
          </Button>
        </CardContent>
      </Card>

      <!-- Reject reason form (inline) -->
      <Card v-if="showRejectModal" class="border-danger-200 bg-danger-50">
        <CardHeader>
          <CardTitle>Rejection Reason</CardTitle>
          <CardDescription>This will be visible to the requester.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <textarea
            v-model="rejectReason"
            class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="3"
            placeholder="State the reason for rejection (min. 5 characters)…"
          />
          <div class="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              :disabled="rejectReason.trim().length < 5 || isRejecting"
              @click="handleReject"
            >
              Confirm Rejection
            </Button>
            <Button variant="outline" size="sm" @click="showRejectModal = false">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <!-- Pay form (inline) -->
      <Card v-if="showPayForm" class="border-primary-200">
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
          <CardDescription>Enter disbursement details to finalise the payment.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Payment Method</label>
            <select
              v-model="paymentMethod"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Cheque</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1"
              >Reference / Transaction #</label
            >
            <input
              v-model="disbursementReference"
              type="text"
              class="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. TRX-2026-0318-99"
            />
          </div>
          <div class="flex gap-2">
            <Button
              variant="default"
              size="sm"
              :disabled="!disbursementReference.trim() || isPaying"
              @click="handlePay"
            >
              Confirm Payment
            </Button>
            <Button variant="outline" size="sm" @click="showPayForm = false">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
