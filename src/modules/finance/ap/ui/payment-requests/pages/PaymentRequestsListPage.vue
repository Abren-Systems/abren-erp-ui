<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus, Clock, CheckCircle2, AlertCircle, Wallet, Inbox } from 'lucide-vue-next'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import { usePaymentRequests } from '../../../application/composables/usePaymentRequests'
import { usePaymentRequestStats } from '../../../application/composables/usePaymentRequestStats'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { PaymentRequest } from '../../../domain/ap.types'

/**
 * Stage 1: The Operational Inbox (Queue) — Payment Requests List Page.
 *
 * Density: Maximum (UX_ARCHITECTURE.md §2.4).
 * Flow: Queue (This Page) → Detail (router.push) → Trace (Drawer).
 */

const router = useRouter()
const { hasPermission } = usePermissions()

// Doctrine Alignment: Sequential Progressive Disclosure
// We avoid competitive panes (master-detail) to protect cognitive load.
const { requests, isLoading: isTableLoading } = usePaymentRequests()
const { stats, isLoading: isStatsLoading } = usePaymentRequestStats()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

function handleRowClick(pr: PaymentRequest) {
  // Linear Task Progression: Grid Click -> Detail Route
  void router.push({ name: 'PaymentRequestDetail', params: { id: pr.id } })
}

function handleCreate() {
  void router.push({ name: 'PaymentRequestCreate' })
}
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header & Global Action -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <Inbox class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Payment Requests
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Process outgoing payments and operational disbursements.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <AppButton v-if="hasPermission('ap:create')" variant="primary" @click="handleCreate">
          <Plus :size="14" class="mr-2" />
          New Request
        </AppButton>
      </div>
    </div>

    <!-- Operational Inlet (In-Queue Summary) -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4 shrink-0 p-8 pb-4">
      <div class="bg-white border border-[var(--color-neutral-200)] shadow-sm p-4 rounded-sm">
        <div class="flex items-center gap-4">
          <div class="rounded-sm bg-orange-50 p-2 text-orange-600 border border-orange-100">
            <Clock :size="20" />
          </div>
          <div>
            <p
              class="text-[11px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
            >
              Submitted
            </p>
            <h3 class="text-2xl font-bold tabular-nums text-[var(--color-neutral-900)] mt-0.5">
              {{ isStatsLoading ? '—' : (stats?.submittedCount ?? 0) }}
            </h3>
          </div>
        </div>
      </div>

      <div class="bg-white border border-[var(--color-neutral-200)] shadow-sm p-4 rounded-sm">
        <div class="flex items-center gap-4">
          <div class="rounded-sm bg-blue-50 p-2 text-blue-600 border border-blue-100">
            <CheckCircle2 :size="20" />
          </div>
          <div>
            <p
              class="text-[11px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
            >
              Approved
            </p>
            <h3 class="text-2xl font-bold tabular-nums text-[var(--color-neutral-900)] mt-0.5">
              {{ isStatsLoading ? '—' : (stats?.approvedCount ?? 0) }}
            </h3>
          </div>
        </div>
      </div>

      <div class="bg-white border border-[var(--color-neutral-200)] shadow-sm p-4 rounded-sm">
        <div class="flex items-center gap-4">
          <div class="rounded-sm bg-red-50 p-2 text-red-600 border border-red-100">
            <AlertCircle :size="20" />
          </div>
          <div>
            <p
              class="text-[11px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
            >
              Rejected
            </p>
            <h3 class="text-2xl font-bold tabular-nums text-[var(--color-neutral-900)] mt-0.5">
              {{ isStatsLoading ? '—' : (stats?.rejectedCount ?? 0) }}
            </h3>
          </div>
        </div>
      </div>

      <div class="bg-white border border-[var(--color-neutral-200)] shadow-sm p-4 rounded-sm">
        <div class="flex items-center gap-4">
          <div class="rounded-sm bg-green-50 p-2 text-green-600 border border-green-100">
            <Wallet :size="20" />
          </div>
          <div>
            <p
              class="text-[11px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)]"
            >
              Resolved
            </p>
            <h3 class="text-2xl font-bold tabular-nums text-[var(--color-neutral-900)] mt-0.5">
              {{ isStatsLoading ? '—' : (stats?.paidCount ?? 0) }}
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Operational Queue (Max Density) -->
    <div class="min-h-0 flex-1 px-8 pb-8">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :data="requests ?? []"
        :columns="paymentRequestColumns"
        :loading="isTableLoading"
        placeholder="Search payment requests…"
        row-clickable
        @row-click="handleRowClick"
      >
        <template #toolbar>
          <!-- Contextual grid actions -->
        </template>
      </DataGrid>
    </div>
  </div>
</template>
