<script setup lang="ts">
/**
 * Page: Payment Requests — Operational Split View.
 *
 * Implements the Multi-Pane Operational View (UX_ARCHITECTURE.md §2):
 *   [Left: Queue Grid] → [Middle: Detail Pane] → [Right: Trace Panel]
 *
 * This is the primary workspace for AP controllers and approvers.
 * The user selects a row → detail fills the middle → trace fills the right.
 */
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/components/button'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/sheet'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import { usePaymentRequests } from '../../../application/composables/usePaymentRequests'
import { usePaymentRequest } from '../../../application/composables/usePaymentRequest'
import { useSubmitPaymentRequest } from '../../../application/composables/useSubmitPaymentRequest'
import { useApprovePaymentRequest } from '../../../application/composables/useApprovePaymentRequest'
import { useRejectPaymentRequest } from '../../../application/composables/useRejectPaymentRequest'
import { usePayPaymentRequest } from '../../../application/composables/usePayPaymentRequest'
import type { PaymentRequest } from '../../../domain/ap.types'

import StatusBadge from '../components/StatusBadge.vue'
import ActionSurface from '../components/ActionSurface.vue'
import DetailPane from '../components/DetailPane.vue'
import TracePanel from '../components/TracePanel.vue'

import { Plus, ChevronLeft, AlertCircle, FileText } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog'

const router = useRouter()
const { requests, isLoading, error, refetch } = usePaymentRequests()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

// --- Split View State ---
const selectedId = ref<string | null>(null)
const showCreateDrawer = ref(false)
const showRejectModal = ref(false)
const showPayModal = ref(false)
const rejectReason = ref('')
const paymentMethod = ref('BANK_TRANSFER')
const disbursementRef = ref('')

// Fetch the selected request detail when ID changes
const { request: selectedRequest, isLoading: isDetailLoading } = usePaymentRequest(
  computed(() => selectedId.value ?? ''),
)

// Action composables (bound to selectedId)
const submitAction = useSubmitPaymentRequest(computed(() => selectedId.value ?? ''))
const approveAction = useApprovePaymentRequest(computed(() => selectedId.value ?? ''))
const rejectAction = useRejectPaymentRequest(computed(() => selectedId.value ?? ''))
const payAction = usePayPaymentRequest(computed(() => selectedId.value ?? ''))

const isActionPending = computed(
  () =>
    submitAction.isPending.value ||
    approveAction.isPending.value ||
    rejectAction.isPending.value ||
    payAction.isPending.value,
)

const isPanelOpen = computed(() => selectedId.value !== null)

function handleRowClick(pr: PaymentRequest) {
  selectedId.value = pr.id
}

function handleClosePanel() {
  selectedId.value = null
}

// --- Action Handlers ---
async function handleSubmit() {
  await submitAction.submit()
}

async function handleApprove() {
  await approveAction.approve()
}

function handleRejectIntent() {
  showRejectModal.value = true
}

async function handleRejectConfirm() {
  if (rejectReason.value.trim().length < 5) return
  await rejectAction.reject(rejectReason.value)
  showRejectModal.value = false
  rejectReason.value = ''
}

function handlePayIntent() {
  showPayModal.value = true
}

async function handlePayConfirm() {
  if (!disbursementRef.value.trim()) return
  await payAction.pay({
    payment_method: paymentMethod.value,
    disbursement_reference: disbursementRef.value,
  })
  showPayModal.value = false
  disbursementRef.value = ''
}

// Map action events from ActionSurface
function handleAction(action: string) {
  const map: Record<string, () => void> = {
    submit: handleSubmit,
    approve: handleApprove,
    reject: handleRejectIntent,
    pay: handlePayIntent,
  }
  map[action]?.()
}
</script>

<template>
  <div class="h-[calc(100vh-theme(spacing.16)-theme(spacing.20))] flex flex-col -m-10">
    <!-- Global Error Alert -->
    <div
      v-if="error"
      class="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3 text-rose-800 text-sm"
    >
      <AlertCircle class="h-4 w-4 shrink-0" />
      <div class="flex-1">
        <span class="font-bold">Error loading requests:</span>
        {{
          error.detail ||
          'The system could not parse the backend data. Please check the console for validation errors.'
        }}
      </div>
      <Button
        variant="outline"
        size="xs"
        class="h-7 border-rose-200 hover:bg-rose-100"
        @click="refetch"
      >
        Retry
      </Button>
    </div>

    <!-- Page Header -->
    <header
      class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white shrink-0"
    >
      <div>
        <h1 class="text-xl font-bold tracking-tight text-neutral-900">Payment Requests</h1>
        <p class="text-xs text-neutral-400 mt-0.5">
          Manage vendor payments and internal reimbursements.
        </p>
      </div>
      <Button variant="default" size="sm" class="gap-1.5" @click="showCreateDrawer = true">
        <Plus class="h-3.5 w-3.5" />
        New Request
      </Button>
    </header>

    <!-- Split View Container -->
    <div class="flex flex-1 overflow-hidden">
      <!-- LEFT PANE: Queue Grid -->
      <div
        :class="[
          'border-r border-neutral-200 transition-all duration-300 overflow-hidden flex flex-col',
          isPanelOpen ? 'w-[340px] shrink-0' : 'flex-1',
        ]"
      >
        <DataGrid
          v-model:sorting="sorting"
          v-model:row-selection="rowSelection"
          v-model:column-visibility="columnVisibility"
          v-model:global-filter="globalFilter"
          :data="requests || []"
          :columns="paymentRequestColumns"
          :loading="isLoading"
          placeholder="Search payment requests…"
          :class="isPanelOpen ? 'text-xs' : ''"
          @row-click="handleRowClick"
        />
      </div>

      <!-- MIDDLE + RIGHT PANES (visible when a row is selected) -->
      <template v-if="isPanelOpen">
        <!-- Middle Pane: Detail -->
        <div
          class="w-[400px] shrink-0 border-r border-neutral-200 bg-white flex flex-col overflow-hidden"
        >
          <!-- Pane Header -->
          <div
            class="flex items-center justify-between px-5 py-3 border-b border-neutral-100 shrink-0 bg-neutral-50/50"
          >
            <button
              class="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              @click="handleClosePanel"
            >
              <ChevronLeft class="h-3.5 w-3.5" />
              Close
            </button>
            <ActionSurface
              v-if="selectedRequest"
              :status="selectedRequest.status"
              :is-action-pending="isActionPending"
              @submit="handleAction('submit')"
              @approve="handleAction('approve')"
              @reject="handleAction('reject')"
              @pay="handleAction('pay')"
            />
          </div>

          <!-- Detail Content -->
          <div v-if="isDetailLoading" class="flex-1 flex items-center justify-center">
            <div class="text-sm text-neutral-400 animate-pulse">Loading…</div>
          </div>
          <DetailPane v-else-if="selectedRequest" :request="selectedRequest" />
        </div>

        <!-- Right Pane: Trace Panel -->
        <div class="flex-1 bg-white flex flex-col overflow-hidden">
          <div v-if="isDetailLoading" class="flex-1 flex items-center justify-center">
            <div class="text-sm text-neutral-400 animate-pulse">Loading…</div>
          </div>
          <TracePanel v-else-if="selectedRequest" :request="selectedRequest" />
          <div v-else class="flex-1 flex flex-col items-center justify-center text-neutral-300">
            <FileText class="h-12 w-12 mb-3" />
            <p class="text-sm">Select a request to view details</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Reject Modal (Destructive Commitment Dialog) -->
    <Dialog :open="showRejectModal" @update:open="showRejectModal = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertCircle class="h-5 w-5 text-danger-500" />
            Reject Payment Request
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The requester will be notified of the rejection.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <textarea
            v-model="rejectReason"
            class="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-danger-500 focus:border-transparent"
            rows="3"
            placeholder="Provide a clear reason for rejection (min. 5 characters)…"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" @click="showRejectModal = false">Cancel</Button>
          <Button
            variant="destructive"
            size="sm"
            :disabled="rejectReason.trim().length < 5 || rejectAction.isPending.value"
            @click="handleRejectConfirm"
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Pay Modal (Execution Commitment Dialog) -->
    <Dialog :open="showPayModal" @update:open="showPayModal = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Execute Payment</DialogTitle>
          <DialogDescription>
            Record the disbursement details. This will create a journal entry in the General Ledger.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4 space-y-4">
          <div>
            <label class="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              v-model="paymentMethod"
              class="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Cheque</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
              Reference / Transaction #
            </label>
            <input
              v-model="disbursementRef"
              type="text"
              class="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. TRX-2026-0411-001"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" @click="showPayModal = false">Cancel</Button>
          <Button
            variant="default"
            size="sm"
            :disabled="!disbursementRef.trim() || payAction.isPending.value"
            @click="handlePayConfirm"
          >
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Create Drawer (Sheet) -->
    <Sheet :open="showCreateDrawer" @update:open="showCreateDrawer = $event">
      <SheetContent class="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Payment Request</SheetTitle>
          <SheetDescription>
            Create a new payment request. It will start in DRAFT status.
          </SheetDescription>
        </SheetHeader>
        <div class="py-6">
          <!-- Placeholder: Will be replaced by the TanStack Form composable -->
          <Button
            variant="outline"
            class="w-full"
            @click="router.push({ name: 'PaymentRequestCreate' })"
          >
            Open Full Form →
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
