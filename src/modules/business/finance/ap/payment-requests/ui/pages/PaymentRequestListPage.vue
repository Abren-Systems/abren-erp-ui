<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/core/ui/data-grid'
import { Button } from '@/core/ui/button'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import { usePaymentRequests } from '../../application/composables/usePaymentRequests'
import type { PaymentRequest } from '../../domain/models/payment-request.types'

const router = useRouter()
const { requests, isLoading } = usePaymentRequests()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

function handleRowClick(pr: PaymentRequest) {
  void router.push({ name: 'PaymentRequestDetail', params: { id: pr.id } })
}

function handleCreate() {
  void router.push({ name: 'PaymentRequestCreate' })
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Payment Requests</h1>
        <p class="text-sm text-neutral-500">Manage vendor payments and internal reimbursements.</p>
      </div>
      <Button variant="default" @click="handleCreate">New Request</Button>
    </header>

    <DataGrid
      v-model:sorting="sorting"
      v-model:row-selection="rowSelection"
      v-model:column-visibility="columnVisibility"
      v-model:global-filter="globalFilter"
      :data="requests || []"
      :columns="paymentRequestColumns"
      :loading="isLoading"
      placeholder="Search payment requests…"
      @row-click="handleRowClick"
    />
  </div>
</template>
