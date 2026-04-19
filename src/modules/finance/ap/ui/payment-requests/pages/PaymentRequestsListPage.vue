<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { Plus, Clock, CheckCircle2, AlertCircle, Wallet } from 'lucide-vue-next'
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
  <div class="flex h-full flex-col gap-4 overflow-hidden">
    <!-- Page Header & Global Action -->
    <div class="flex shrink-0 items-end justify-between px-1">
      <div>
        <h1 class="m-0 text-xl font-semibold tracking-tight text-[var(--color-grid-text)]">
          Payment Requests
        </h1>
        <p class="text-sm text-neutral-500">
          Process outgoing payments and operational disbursements.
        </p>
      </div>
    </div>

    <!-- Operational Inlet (In-Queue Summary) -->
    <div class="grid grid-cols-1 gap-3 md:grid-cols-4 shrink-0 px-1">
      <Card class="border-neutral-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent class="p-3">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Clock :size="18" />
            </div>
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Submitted
              </p>
              <h3 class="text-lg font-bold tabular-nums">
                {{ isStatsLoading ? '—' : (stats?.submittedCount ?? 0) }}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border-neutral-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent class="p-3">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CheckCircle2 :size="18" />
            </div>
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Approved
              </p>
              <h3 class="text-lg font-bold tabular-nums">
                {{ isStatsLoading ? '—' : (stats?.approvedCount ?? 0) }}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border-neutral-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent class="p-3">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-red-50 p-2 text-red-600">
              <AlertCircle :size="18" />
            </div>
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Rejected
              </p>
              <h3 class="text-lg font-bold tabular-nums">
                {{ isStatsLoading ? '—' : (stats?.rejectedCount ?? 0) }}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border-neutral-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent class="p-3">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-green-50 p-2 text-green-600">
              <Wallet :size="18" />
            </div>
            <div>
              <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Resolved
              </p>
              <h3 class="text-lg font-bold tabular-nums">
                {{ isStatsLoading ? '—' : (stats?.paidCount ?? 0) }}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Operational Queue (Max Density) -->
    <div class="min-h-0 flex-1 overflow-hidden">
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
          <Button
            v-if="hasPermission('ap:create')"
            size="sm"
            class="h-[26px] px-2.5 text-xs"
            @click="handleCreate"
          >
            <Plus :size="13" class="mr-1" />
            New Request
          </Button>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
