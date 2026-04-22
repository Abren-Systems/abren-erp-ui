<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppBadge } from '@/shared/components/primitives'
import { ArrowLeft, MoreHorizontal, History, CheckCircle, FileText } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/dropdown-menu'
import { useVendorBill } from '../../../application/composables/useVendorBill'
import { useValidateVendorBill } from '../../../application/composables/useValidateVendorBill'
import { useRejectVendorBill } from '../../../application/composables/useRejectVendorBill'
import { usePermissions } from '@/shared/auth/usePermissions'
import VendorBillTraceDrawer from '../components/VendorBillTraceDrawer.vue'
import VendorBillRejectModal from '../components/VendorBillRejectModal.vue'

/**
 * Stage 2: Focus Canvas — Vendor Bill Detail Page.
 *
 * Progressive Disclosure flow (UX_ARCHITECTURE.md §2):
 *   VendorBillsListPage → THIS PAGE → TraceDrawer / ActionModals
 *
 * Action Surface (3-tier hierarchy per UX_ARCHITECTURE.md §6):
 *   Primary:  Validate & Accrue (DRAFT), Create PR (VALIDATED)
 *   Secondary: View Trace
 *   Tertiary: Reject/Void (destructive, via overflow + RejectModal)
 */

const props = defineProps<{ id: string }>()
const router = useRouter()
const { hasPermission } = usePermissions()

const { bill, isLoading } = useVendorBill(props.id)
const { validate, isValidating } = useValidateVendorBill(props.id)
const { reject, isPending: isRejecting } = useRejectVendorBill(props.id)

// Overlay state
const isTraceOpen = ref(false)
const isRejectModalOpen = ref(false)

const isActionPending = computed(() => isValidating.value || isRejecting.value)

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'neutral' | 'warning' | 'danger'> = {
  DRAFT: 'neutral',
  VALIDATED: 'success',
  PAID: 'primary',
}

async function handleValidate() {
  await validate()
}

async function handleReject(reason: string) {
  await reject(reason)
  isRejectModalOpen.value = false
}

function handleCreatePR() {
  void router.push({ name: 'PaymentRequestsList' }) // In real impl, would perhaps pass bill ID as query param
}

function goBack() {
  router.push({ name: 'VendorBillsList' })
}
</script>

<template>
  <div v-if="isLoading && !bill" class="flex h-full items-center justify-center">
    <p class="text-sm text-neutral-500">Loading vendor bill…</p>
  </div>

  <div v-else-if="bill" class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- ── Header / Action Surface ──────────────────────────── -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <AppButton variant="stealth" @click="goBack">
          <ArrowLeft :size="18" />
        </AppButton>
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <FileText class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
              Vendor Bill
            </h1>
            <AppBadge :variant="STATUS_VARIANT[bill.status] || 'neutral'">
              {{ bill.status }}
            </AppBadge>
          </div>
          <p class="mt-1 text-xs font-mono text-[var(--color-neutral-400)]">{{ bill.id }}</p>
        </div>
      </div>

      <!-- Action Surface: 3-tier hierarchy -->
      <div class="flex items-center gap-2">
        <!-- Secondary: Trace -->
        <AppButton variant="outline" @click="isTraceOpen = true">
          <History :size="14" class="mr-2" />
          Trace
        </AppButton>

        <!-- Primary: Validate (DRAFT → VALIDATED) -->
        <AppButton
          v-if="bill.status === 'DRAFT' && hasPermission('ap:post')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleValidate"
        >
          <CheckCircle :size="14" class="mr-2" />
          Validate & Accrue
        </AppButton>

        <!-- Primary: Create PR (VALIDATED → PR Flow) -->
        <AppButton
          v-if="bill.status === 'VALIDATED' && hasPermission('ap:create')"
          variant="primary"
          :disabled="isActionPending"
          @click="handleCreatePR"
        >
          <FileText :size="14" class="mr-2" />
          Create Payment Request
        </AppButton>

        <!-- Tertiary: Overflow for destructive actions -->
        <DropdownMenu v-if="bill.status === 'DRAFT' && hasPermission('ap:post')">
          <DropdownMenuTrigger as-child>
            <AppButton variant="stealth">
              <MoreHorizontal :size="16" />
            </AppButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="min-w-[160px]">
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="isRejectModalOpen = true">
              <span class="text-[var(--color-danger-600)]">Void Draft Bill</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- ── Main Canvas: Bill Details ──────────────────────── -->
    <div class="flex-1 overflow-y-auto p-8 space-y-8">
      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Metadata summary -->
        <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div class="bg-white p-6 rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
            >
              Total Amount
            </p>
            <p class="mt-2 text-2xl font-bold tabular-nums text-[var(--color-neutral-900)]">
              {{ bill.totalAmount.format() }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
            >
              Bill Number
            </p>
            <p class="mt-2 font-mono text-xl font-bold text-[var(--color-primary-700)]">
              {{ bill.billNumber }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
            >
              Date Issued
            </p>
            <p class="mt-2 text-lg font-bold text-[var(--color-neutral-900)]">
              {{ bill.issueDate.toLocaleDateString() }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
            >
              Vendor ID
            </p>
            <code
              class="mt-2 block text-xs font-mono text-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] px-2 py-1 rounded-sm border border-[var(--color-neutral-100)] truncate"
            >
              {{ bill.vendorId }}
            </code>
          </div>
        </div>

        <!-- Justification -->
        <div class="bg-white p-6 rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-[var(--color-neutral-500)] mb-2"
          >
            Justification
          </p>
          <p class="text-sm leading-relaxed text-[var(--color-neutral-800)]">
            {{ bill.justification }}
          </p>
        </div>

        <!-- Expense Lines -->
        <div class="space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-500)]">
            Expense Lines
          </h2>
          <div
            class="bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm overflow-hidden"
          >
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
                  <th
                    class="px-4 py-3 text-left font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
                  >
                    Description
                  </th>
                  <th
                    class="px-4 py-3 text-right font-bold uppercase tracking-widest text-[var(--color-neutral-500)] tabular-nums"
                  >
                    Amount
                  </th>
                  <th
                    class="px-4 py-3 text-left font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
                  >
                    GL Account
                  </th>
                  <th
                    class="px-4 py-3 text-left font-bold uppercase tracking-widest text-[var(--color-neutral-500)]"
                  >
                    Category
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-neutral-100)]">
                <tr
                  v-for="line in bill.lines"
                  :key="line.id || Math.random().toString()"
                  class="hover:bg-[var(--color-neutral-50)]/50 transition-colors"
                >
                  <td class="px-4 py-3 text-[var(--color-neutral-800)]">{{ line.description }}</td>
                  <td
                    class="px-4 py-3 text-right tabular-nums font-bold text-[var(--color-neutral-900)]"
                  >
                    {{ line.amount.format() }}
                  </td>
                  <td class="px-4 py-3 font-mono text-[var(--color-neutral-500)]">
                    {{ line.accountId?.slice(0, 8) ?? '—' }}
                  </td>
                  <td class="px-4 py-3 font-mono text-[var(--color-neutral-500)]">
                    {{ line.categoryId?.slice(0, 8) ?? '—' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr
                  class="bg-[var(--color-neutral-50)]/30 border-t border-[var(--color-neutral-200)] font-bold"
                >
                  <td class="px-4 py-4 text-[var(--color-neutral-600)]">Total Bill Value</td>
                  <td
                    class="px-4 py-4 text-right tabular-nums text-lg text-[var(--color-primary-700)]"
                  >
                    {{ bill.totalAmount.format() }}
                  </td>
                  <td colspan="2" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Stage 3: TraceDrawer ───────────────────────────────── -->
    <VendorBillTraceDrawer v-model:open="isTraceOpen" :bill="bill" />

    <!-- ── Guard: Reject ActionModal (destructive) ────────────── -->
    <VendorBillRejectModal
      v-model:open="isRejectModalOpen"
      :is-pending="isRejecting"
      @confirm="handleReject"
    />
  </div>
</template>
