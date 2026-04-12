<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
import { Plus } from 'lucide-vue-next'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import { usePaymentRequests } from '../../../application/composables/usePaymentRequests'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { PaymentRequest } from '../../../domain/ap.types'

/**
 * Stage 1: Queue — Payment Requests List Page.
 *
 * Progressive Disclosure flow (UX_ARCHITECTURE.md §2):
 *   THIS PAGE → router.push(PaymentRequestDetail) → PaymentRequestDetailPage
 *   THIS PAGE → router.push(PaymentRequestCreate) → PaymentRequestCreatePage
 *
 * Density: Maximum. No inline mutations. No pane splitting.
 * Row clicks navigate cleanly to the Focus Canvas (Detail page).
 */

const router = useRouter()
const { hasPermission } = usePermissions()
const { requests, isLoading, refetch } = usePaymentRequests()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

function handleRowClick(pr: PaymentRequest) {
  void router.push({ name: 'PaymentRequestDetail', params: { id: pr.id } })
}

function handleCreate() {
  void router.push({ name: 'PaymentRequestCreate' })
}
</script>

<template>
  <div class="flex h-full flex-col gap-5">
    <!-- Page Header -->
    <div class="flex shrink-0 items-start justify-between">
      <div>
        <h1 class="m-0 text-heading text-[var(--color-grid-text)]">
          Payment Requests
        </h1>
        <p class="mt-1 text-body-sm text-[var(--color-grid-text-muted)]">
          Manage vendor payments and internal reimbursements.
        </p>
      </div>
    </div>

    <!-- DataGrid: Maximum Density Queue -->
    <div class="min-h-0 flex-1">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :data="requests ?? []"
        :columns="paymentRequestColumns"
        :loading="isLoading"
        placeholder="Search payment requests…"
        row-clickable
        @row-click="handleRowClick"
      >
        <template #toolbar>
          <Button
            v-if="hasPermission('ap:create_request')"
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
