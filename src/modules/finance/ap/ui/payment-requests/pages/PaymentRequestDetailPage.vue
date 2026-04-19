<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { ArrowLeft, MoreHorizontal, History, CheckCircle, Send } from 'lucide-vue-next'
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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  SUBMITTED: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  PAID: 'default',
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

function formatMoney(money: any) {
  if (!money || typeof money.format !== 'function') return '—'
  return money.format()
}
</script>

<template>
  <div v-if="isLoading && !request" class="flex h-full items-center justify-center">
    <p class="text-sm text-neutral-500">Loading payment request…</p>
  </div>

  <div v-else-if="request" class="flex h-full flex-col">
    <!-- ── Header / Action Surface ──────────────────────────── -->
    <div class="flex shrink-0 items-center justify-between border-b px-6 py-4">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold tracking-tight">Payment Request</h1>
            <Badge :variant="STATUS_VARIANT[request.status]">
              {{ request.status }}
            </Badge>
          </div>
          <p class="mt-0.5 font-mono text-xs text-neutral-400">{{ request.id }}</p>
        </div>
      </div>

      <!-- Action Surface: 3-tier hierarchy -->
      <div class="flex items-center gap-2">
        <!-- Secondary: Trace -->
        <Button variant="outline" size="sm" @click="isTraceOpen = true">
          <History class="mr-1.5 h-3.5 w-3.5" />
          Trace
        </Button>

        <!-- Primary: Submit (DRAFT → SUBMITTED) -->
        <Button
          v-if="request.status === 'DRAFT' && hasPermission('ap:create')"
          size="sm"
          :disabled="isActionPending"
          @click="handleSubmit"
        >
          <Send class="mr-1.5 h-3.5 w-3.5" />
          Submit for Approval
        </Button>

        <!-- Primary: Approve (SUBMITTED → APPROVED) -->
        <Button
          v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')"
          size="sm"
          :disabled="isActionPending"
          @click="handleApprove"
        >
          <CheckCircle class="mr-1.5 h-3.5 w-3.5" />
          Approve
        </Button>

        <!-- Primary: Pay (APPROVED → PAID) -->
        <Button
          v-if="request.status === 'APPROVED' && hasPermission('ap:post')"
          size="sm"
          :disabled="isActionPending"
          @click="isPayModalOpen = true"
        >
          Mark as Paid
        </Button>

        <!-- Tertiary: Overflow for destructive/secondary actions -->
        <DropdownMenu v-if="request.status === 'SUBMITTED' && hasPermission('ap:approve')">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive" @click="isRejectModalOpen = true">
              Reject Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- ── Main Canvas: Request Details ──────────────────────── -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Metadata summary -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Total Amount</p>
          <p class="mt-1 text-xl font-bold tabular-nums">{{ formatMoney(request.totalAmount) }}</p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Currency</p>
          <p class="mt-1 font-mono text-lg font-semibold">{{ request.currency }}</p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Approval Step</p>
          <p class="mt-1 text-lg font-semibold">Step {{ request.currentApprovalStep }}</p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-xs font-medium uppercase text-neutral-400">Lines</p>
          <p class="mt-1 text-lg font-semibold">{{ request.lines.length }}</p>
        </div>
      </div>

      <!-- Justification -->
      <div class="rounded-lg border p-4">
        <p class="mb-1 text-xs font-medium uppercase text-neutral-400">Justification</p>
        <p class="text-sm text-neutral-700">{{ request.justification }}</p>
      </div>

      <!-- Line Items -->
      <div>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Line Items
        </h2>
        <div class="overflow-hidden rounded-lg border">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th class="px-4 py-2.5 text-left font-medium text-neutral-500">Description</th>
                <th class="px-4 py-2.5 text-right font-medium text-neutral-500 tabular-nums">
                  Amount
                </th>
                <th class="px-4 py-2.5 text-left font-medium text-neutral-500">GL Account</th>
                <th class="px-4 py-2.5 text-left font-medium text-neutral-500">Category</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in request.lines"
                :key="line.id"
                class="border-t transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
              >
                <td class="px-4 py-2.5">{{ line.description }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums font-semibold">
                  {{ formatMoney(line.amount) }}
                </td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-500">
                  {{ line.accountId?.slice(0, 8) ?? '—' }}
                </td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-500">
                  {{ line.categoryId?.slice(0, 8) ?? '—' }}
                </td>
              </tr>
              <tr class="border-t bg-neutral-50/50 font-semibold dark:bg-neutral-900/20">
                <td class="px-4 py-2.5">Total</td>
                <td class="px-4 py-2.5 text-right tabular-nums font-bold">
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
