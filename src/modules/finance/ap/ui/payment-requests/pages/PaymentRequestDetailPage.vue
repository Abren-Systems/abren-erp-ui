<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppBadge } from '@/shared/components/primitives'
import {
  ArrowLeft,
  MoreHorizontal,
  History,
  CheckCircle,
  Send,
  FileSpreadsheet,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

/**
 * Stage 2: Focus Canvas — Payment Request Detail Page.
 *
 * Progressive Disclosure flow (UX_ARCHITECTURE.md §2):
 *   PaymentRequestsListPage → THIS PAGE → TraceDrawer / ActionModals
 *
 * Action Surface (3-tier hierarchy per UX_ARCHITECTURE.md §6):
 *   Primary:  Submit (DRAFT), Approve (SUBMITTED), Pay (APPROVED)
 *   Secondary: View Trace
 *   Tertiary: Reject (destructive, via overflow + RejectModal)
 */

const props = defineProps<{ id: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()

const { request, isLoading } = usePaymentRequest(props.id)
const { submit, isPending: isSubmitting } = useSubmitPaymentRequest(props.id)
const { approve, isPending: isApproving } = useApprovePaymentRequest(props.id)
const { reject, isPending: isRejecting } = useRejectPaymentRequest(props.id)
const { pay, isPending: isPaying } = usePayPaymentRequest(props.id)

// Overlay state
const isTraceOpen = ref(false)
const isRejectModalOpen = ref(false)
const isPayModalOpen = ref(false)

const isActionPending = computed(
  () => isSubmitting.value || isApproving.value || isRejecting.value || isPaying.value,
)

const STATUS_VARIANT: Record<string, 'neutral' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  PAID: 'success',
}

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
  router.push({ name: 'PaymentRequestsList' })
}

function formatMoney(money: unknown) {
  const m = money as { format: () => string } | null
  if (!m || typeof m.format !== 'function') return '—'
  return m.format()
}
</script>

<template>
  <div v-if="isLoading && !request" class="flex h-full items-center justify-center">
    <p class="text-sm text-neutral-500">Loading payment request…</p>
  </div>

  <div v-else-if="request" class="flex h-full flex-col">
    <!-- ── Header / Action Surface ──────────────────────────── -->
    <div
      class="flex shrink-0 items-center justify-between border-b border-[var(--color-neutral-200)] px-6 py-4 bg-white"
    >
      <div class="flex items-center gap-4">
        <AppButton variant="stealth" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </AppButton>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold tracking-tight text-[var(--color-neutral-900)]">
              Payment Request
            </h1>
            <AppBadge :variant="STATUS_VARIANT[request.status]">
              {{ request.status }}
            </AppBadge>
          </div>
          <p class="mt-0.5 font-mono text-xs text-[var(--color-neutral-400)]">{{ request.id }}</p>
        </div>
      </div>

      <!-- Action Surface: 3-tier hierarchy -->
      <div class="flex items-center gap-2">
        <!-- Secondary: Trace -->
        <AppButton variant="outline" @click="isTraceOpen = true">
          <History class="mr-1.5 h-3.5 w-3.5" />
          Trace
        </AppButton>

        <!-- Primary: Submit (DRAFT → SUBMITTED) -->
        <AppButton
          v-if="request.status === 'DRAFT' && hasPermission('ap:create')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleSubmit"
        >
          <Send class="mr-1.5 h-3.5 w-3.5" />
          Submit for Approval
        </AppButton>

        <!-- Primary: Approve (SUBMITTED → APPROVED) -->
        <AppButton
          v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleApprove"
        >
          <CheckCircle class="mr-1.5 h-3.5 w-3.5" />
          Approve
        </AppButton>

        <!-- Primary: Pay (APPROVED → PAID) -->
        <AppButton
          v-if="request.status === 'APPROVED' && hasPermission('ap:post')"
          variant="primary"
          :disabled="isActionPending"
          @click="isPayModalOpen = true"
        >
          Mark as Paid
        </AppButton>

        <!-- Tertiary: Overflow for destructive/secondary actions -->
        <DropdownMenu v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')">
          <DropdownMenuTrigger as-child>
            <AppButton variant="stealth">
              <MoreHorizontal class="h-4 w-4" />
            </AppButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-[var(--color-danger-600)]"
              @click="isRejectModalOpen = true"
            >
              Reject Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- ── Main Canvas: Request Details ──────────────────────── -->
    <div class="flex-1 overflow-y-auto p-8 bg-[var(--app-canvas)] space-y-6">
      <div class="max-w-5xl mx-auto">
        <!-- Metadata summary -->
        <div class="grid grid-cols-2 gap-6 md:grid-cols-4 mb-6">
          <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
              Total Amount
            </p>
            <p class="mt-2 text-xl font-bold tabular-nums text-[var(--color-neutral-900)]">
              {{ formatMoney(request.totalAmount) }}
            </p>
          </div>
          <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
              Currency
            </p>
            <p class="mt-2 text-xl font-bold text-[var(--color-neutral-900)] font-mono">
              {{ request.currency }}
            </p>
          </div>
          <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
              Approval Step
            </p>
            <p class="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">
              Step {{ request.currentApprovalStep }}
            </p>
          </div>
          <div class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
              Lines
            </p>
            <p class="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">
              {{ request.lines.length }}
            </p>
          </div>
        </div>

        <!-- Justification -->
        <div
          class="bg-white rounded-sm border border-[var(--color-neutral-200)] p-5 shadow-sm mb-6"
        >
          <p
            class="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]"
          >
            Justification
          </p>
          <p class="text-[14px] leading-relaxed text-[var(--color-neutral-700)]">
            {{ request.justification }}
          </p>
        </div>
      </div>

      <!-- Line Items -->
      <div
        class="max-w-5xl mx-auto bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]"
        >
          <div class="flex items-center gap-2">
            <FileSpreadsheet :size="16" class="text-[var(--color-neutral-500)]" />
            <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)]">
              Line Items
            </h2>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[var(--color-neutral-50)]">
              <tr>
                <th
                  class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)]"
                >
                  Description
                </th>
                <th
                  class="px-4 py-3 text-right font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)] tabular-nums"
                >
                  Amount
                </th>
                <th
                  class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)]"
                >
                  GL Account
                </th>
                <th
                  class="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-[var(--color-neutral-500)]"
                >
                  Category
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-neutral-100)]">
              <tr
                v-for="line in request.lines"
                :key="line.id"
                class="transition-colors hover:bg-[var(--color-neutral-50)]"
              >
                <td class="px-4 py-3 text-[var(--color-neutral-700)]">{{ line.description }}</td>
                <td
                  class="px-4 py-3 text-right tabular-nums font-bold text-[var(--color-neutral-900)]"
                >
                  {{ formatMoney(line.amount) }}
                </td>
                <td class="px-4 py-3 font-mono text-xs text-[var(--color-neutral-500)]">
                  {{ line.accountId?.slice(0, 8) ?? '—' }}
                </td>
                <td class="px-4 py-3 font-mono text-xs text-[var(--color-neutral-500)]">
                  {{ line.categoryId?.slice(0, 8) ?? '—' }}
                </td>
              </tr>
              <tr class="bg-[var(--color-neutral-50)]/50 font-bold">
                <td class="px-4 py-4 text-[var(--color-neutral-600)]">Total Summary</td>
                <td
                  class="px-4 py-4 text-right tabular-nums text-lg text-[var(--color-primary-700)]"
                >
                  {{ formatMoney(request.totalAmount) }}
                </td>
                <td colspan="2" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── Stage 3: TraceDrawer ───────────────────────────────── -->
    <PaymentRequestTraceDrawer v-model:open="isTraceOpen" :request="request" />

    <!-- ── Guard: Reject ActionModal (destructive) ────────────── -->
    <PaymentRequestRejectModal
      v-model:open="isRejectModalOpen"
      :is-pending="isRejecting"
      @confirm="handleReject"
    />

    <!-- ── Guard: Pay ActionModal ─────────────────────────────── -->
    <PaymentRequestPayModal
      v-slot:default
      v-model:open="isPayModalOpen"
      :total-amount="formatMoney(request.totalAmount)"
      :is-pending="isPaying"
      @confirm="handlePay"
    />
  </div>
</template>
