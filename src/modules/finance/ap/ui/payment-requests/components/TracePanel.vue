<script setup lang="ts">
/**
 * Trace Panel — Audit & Trace First-Class UX Surface.
 *
 * Implements the Right Pane of the Operational Split View (UX_ARCHITECTURE.md §7):
 *   - Trace tab: Lineage to parent/child documents
 *   - Lines tab: Detailed financial line items
 *   - Financial Impact tab: Projected or realized debits/credits
 *
 * Rule: "No number exists without a visible origin."
 */
import { ref, computed } from 'vue'
import type { PaymentRequest } from '../../../domain/ap.types'
import { FileText, ArrowRightLeft, Layers } from 'lucide-vue-next'

const props = defineProps<{ request: PaymentRequest }>()

type TabId = 'lines' | 'trace' | 'impact'
const activeTab = ref<TabId>('lines')

const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: 'lines', label: 'Lines', icon: Layers },
  { id: 'trace', label: 'Trace', icon: FileText },
  { id: 'impact', label: 'Financial Impact', icon: ArrowRightLeft },
]

const totalDebit = computed(() => props.request.totalAmount)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Tab Bar -->
    <div class="flex border-b border-neutral-200 bg-neutral-50/50 shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px',
          activeTab === tab.id
            ? 'border-primary-600 text-primary-700'
            : 'border-transparent text-neutral-400 hover:text-neutral-600',
        ]"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="h-3.5 w-3.5" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Lines Tab -->
      <div v-if="activeTab === 'lines'" class="space-y-2">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-neutral-200">
              <th
                class="text-left py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                class="text-right py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="line in request.lines"
              :key="line.id"
              class="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
            >
              <td class="py-2.5 text-neutral-800">{{ line.description }}</td>
              <td class="py-2.5 text-right font-mono font-semibold tabular-nums text-neutral-900">
                {{ line.amount.format() }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-neutral-200">
              <td class="py-2.5 font-bold text-neutral-900">Total</td>
              <td class="py-2.5 text-right font-bold font-mono tabular-nums text-neutral-900">
                {{ request.totalAmount.format() }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Trace Tab -->
      <div v-if="activeTab === 'trace'" class="space-y-4">
        <div class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
          Document Lineage
        </div>

        <!-- Workflow Timeline -->
        <div class="relative pl-6 space-y-4">
          <div class="absolute left-2 top-1 bottom-1 w-px bg-neutral-200" />

          <div class="relative">
            <div
              class="absolute left-[-16px] top-1 h-2.5 w-2.5 rounded-full bg-neutral-300 ring-2 ring-white"
            />
            <div class="text-sm font-medium text-neutral-800">Created</div>
            <div class="text-xs text-neutral-400 font-mono">
              by {{ request.requesterId.slice(0, 8) }}…
            </div>
          </div>

          <div v-if="request.submittedAt" class="relative">
            <div
              class="absolute left-[-16px] top-1 h-2.5 w-2.5 rounded-full bg-warning-500 ring-2 ring-white"
            />
            <div class="text-sm font-medium text-neutral-800">Submitted</div>
            <div class="text-xs text-neutral-400">
              {{ request.submittedAt }}
            </div>
          </div>

          <div v-if="request.status === 'APPROVED' || request.status === 'PAID'" class="relative">
            <div
              class="absolute left-[-16px] top-1 h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-white"
            />
            <div class="text-sm font-medium text-neutral-800">Approved</div>
            <div v-if="request.assignedApproverId" class="text-xs text-neutral-400 font-mono">
              by {{ request.assignedApproverId.slice(0, 8) }}…
            </div>
          </div>

          <div v-if="request.status === 'PAID'" class="relative">
            <div
              class="absolute left-[-16px] top-1 h-2.5 w-2.5 rounded-full bg-success-500 ring-2 ring-white"
            />
            <div class="text-sm font-medium text-neutral-800">Paid</div>
            <div class="text-xs text-neutral-400">
              {{ request.paidAt }}
            </div>
          </div>

          <div v-if="request.status === 'REJECTED'" class="relative">
            <div
              class="absolute left-[-16px] top-1 h-2.5 w-2.5 rounded-full bg-danger-500 ring-2 ring-white"
            />
            <div class="text-sm font-medium text-danger-700">Rejected</div>
          </div>
        </div>

        <!-- Source Document Link -->
        <div
          v-if="request.sourceId"
          class="mt-6 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
        >
          <div class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Source Document
          </div>
          <div class="text-sm font-mono text-primary-600 cursor-pointer hover:underline">
            {{ request.sourceModule }} / {{ request.sourceId }}
          </div>
        </div>
      </div>

      <!-- Financial Impact Tab -->
      <div v-if="activeTab === 'impact'" class="space-y-4">
        <div class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
          Projected Ledger Impact
        </div>

        <div v-if="request.status === 'PAID'" class="space-y-3">
          <!-- Debit -->
          <div
            class="flex items-center justify-between p-3 bg-danger-50 rounded-lg border border-danger-100"
          >
            <div>
              <div class="text-[10px] font-bold text-danger-400 uppercase tracking-wider">
                Debit
              </div>
              <div class="text-sm font-medium text-danger-800">Accounts Payable / Expense</div>
            </div>
            <div class="text-right font-mono font-bold tabular-nums text-danger-700">
              {{ totalDebit.format() }}
            </div>
          </div>
          <!-- Credit -->
          <div
            class="flex items-center justify-between p-3 bg-success-50 rounded-lg border border-success-100"
          >
            <div>
              <div class="text-[10px] font-bold text-success-400 uppercase tracking-wider">
                Credit
              </div>
              <div class="text-sm font-medium text-success-800">Cash / Bank</div>
            </div>
            <div class="text-right font-mono font-bold tabular-nums text-success-700">
              {{ totalDebit.format() }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <ArrowRightLeft class="h-8 w-8 text-neutral-200 mx-auto mb-2" />
          <p class="text-sm text-neutral-400">
            Financial Impact is projected after the request reaches
            <span class="font-semibold text-success-600">PAID</span> status.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
