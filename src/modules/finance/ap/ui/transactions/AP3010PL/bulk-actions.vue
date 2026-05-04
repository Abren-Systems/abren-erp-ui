<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppButton, AppDialog, AppInput } from '@/shared/components/primitives'
import { CheckCircle, XCircle, Download } from 'lucide-vue-next'
import { useBulkPaymentRequestActions } from '../../../application/composables/useBulkPaymentRequestActions'
import type { PaymentRequestId } from '@/shared/types/brand.types'
import type { PaymentRequest } from '../../../domain/ap.types'

const props = defineProps<{
  selectedIds: PaymentRequestId[]
  filteredRequests: PaymentRequest[]
}>()

const emit = defineEmits<{
  (e: 'clear-selection'): void
}>()

const {
  approveMultiple,
  rejectMultiple,
  isPending: isBulkPending,
  results: bulkResults,
  computeCounts,
  successCount,
  failureCount,
} = useBulkPaymentRequestActions()

const selectedCount = computed(() => props.selectedIds.length)

const bulkApproveOpen = ref(false)
const bulkRejectOpen = ref(false)
const bulkRejectReason = ref('')
const bulkResultsOpen = ref(false)

function handleBulkApprove() {
  bulkApproveOpen.value = true
}

function handleBulkReject() {
  bulkRejectOpen.value = true
}

async function confirmBulkApprove() {
  bulkApproveOpen.value = false
  const results = await approveMultiple(props.selectedIds)
  computeCounts(results)
  bulkResultsOpen.value = true
  emit('clear-selection')
}

async function confirmBulkReject() {
  if (!bulkRejectReason.value) return
  bulkRejectOpen.value = false
  const results = await rejectMultiple(props.selectedIds, bulkRejectReason.value)
  computeCounts(results)
  bulkRejectReason.value = ''
  bulkResultsOpen.value = true
  emit('clear-selection')
}

function handleExport() {
  const rows = props.filteredRequests
  if (rows.length === 0) return

  const headers = ['Request Number', 'Status', 'Beneficiary', 'Currency', 'Amount', 'Submitted At']
  const csvRows = rows.map((r) => [
    r.requestNumber,
    r.status,
    r.beneficiaryName ?? r.beneficiaryId,
    r.currency,
    r.totalAmount.toNumber(),
    r.submittedAt ?? '',
  ])

  const csv = [headers, ...csvRows].map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `payment-requests-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <!-- Floating Bulk Action Bar -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="selectedCount > 0"
        class="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 shadow-[0_20px_40px_rgba(15,23,42,0.2)] text-white z-10 border border-neutral-700"
      >
        <span class="text-sm font-semibold mr-2">{{ selectedCount }} selected</span>
        <AppButton
          variant="stealth"
          class="text-neutral-100 hover:text-white hover:bg-neutral-800"
          size="sm"
          :disabled="isBulkPending"
          @click="handleBulkApprove"
        >
          <template #start><CheckCircle :size="14" /></template>
          Approve
        </AppButton>
        <AppButton
          variant="stealth"
          class="text-neutral-100 hover:text-white hover:bg-neutral-800"
          size="sm"
          :disabled="isBulkPending"
          @click="handleBulkReject"
        >
          <template #start><XCircle :size="14" /></template>
          Reject
        </AppButton>
        <div class="w-px h-4 bg-neutral-700 mx-1"></div>
        <AppButton
          variant="stealth"
          class="text-neutral-100 hover:text-white hover:bg-neutral-800"
          size="sm"
          title="Exports currently loaded results"
          @click="handleExport"
        >
          <template #start><Download :size="14" /></template>
          Export
        </AppButton>
      </div>
    </Transition>

    <!-- Bulk Processing Overlay -->
    <div
      v-if="isBulkPending"
      class="absolute inset-0 bg-white/60 flex items-center justify-center z-20 rounded-xl"
    >
      <div class="flex flex-col items-center gap-3">
        <div
          class="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
        />
        <p class="text-sm font-medium text-neutral-700">
          Processing {{ selectedCount }} individual actions…
        </p>
      </div>
    </div>

    <!-- Bulk Approve Confirmation -->
    <AppDialog v-model:open="bulkApproveOpen" title="Confirm Individual Approvals" size="sm">
      <p class="text-sm text-neutral-600">
        You are about to process <strong>{{ selectedCount }}</strong> individual approval actions.
        Each request will be approved separately — there is no combined transaction.
      </p>
      <template #footer>
        <AppButton variant="outline" @click="bulkApproveOpen = false">Cancel</AppButton>
        <AppButton variant="primary" @click="confirmBulkApprove">Approve All</AppButton>
      </template>
    </AppDialog>

    <!-- Bulk Reject Confirmation -->
    <AppDialog v-model:open="bulkRejectOpen" title="Reject Selected Requests" size="sm">
      <div class="space-y-4">
        <p class="text-sm text-neutral-600">
          You are about to reject <strong>{{ selectedCount }}</strong> requests individually. Please
          provide a reason.
        </p>
        <AppInput
          v-model="bulkRejectReason"
          placeholder="Reason for rejection (required)..."
          required
        />
      </div>
      <template #footer>
        <AppButton variant="outline" @click="bulkRejectOpen = false">Cancel</AppButton>
        <AppButton
          variant="primary"
          class="bg-danger-600 hover:bg-danger-700"
          :disabled="!bulkRejectReason"
          @click="confirmBulkReject"
          >Reject All</AppButton
        >
      </template>
    </AppDialog>

    <!-- Bulk Results -->
    <AppDialog v-model:open="bulkResultsOpen" title="Action Results" size="sm">
      <div class="space-y-3">
        <div v-if="successCount > 0" class="flex items-center gap-2 text-sm">
          <CheckCircle :size="16" class="text-success-600" />
          <span class="text-neutral-700"
            ><strong>{{ successCount }}</strong> succeeded</span
          >
        </div>
        <div v-if="failureCount > 0" class="flex items-center gap-2 text-sm">
          <XCircle :size="16" class="text-danger-600" />
          <span class="text-neutral-700"
            ><strong>{{ failureCount }}</strong> failed</span
          >
        </div>
        <div v-if="failureCount > 0" class="space-y-1 mt-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Failed Items
          </p>
          <div
            v-for="result in bulkResults.filter((r) => r.status === 'rejected')"
            :key="result.id"
            class="text-xs text-danger-700 bg-danger-50 rounded-lg px-3 py-2"
          >
            {{ result.id.slice(0, 8) }}… — {{ result.error }}
          </div>
        </div>
      </div>
      <template #footer>
        <AppButton variant="primary" @click="bulkResultsOpen = false">Close</AppButton>
      </template>
    </AppDialog>
  </div>
</template>
