<script setup lang="ts">
import { ref } from 'vue'
import { DataGrid, useDataGrid } from '@/core/ui/data-grid'
import { Button } from '@/core/ui/button'
import { paymentRequestColumns } from '../grids/payment-request.grid'
import { usePaymentRequests } from '../../application/composables/usePaymentRequests'
import { useSubmitPaymentRequest } from '../../application/composables/useSubmitPaymentRequest'
import type { PaymentRequest } from '../../domain/models/payment-request.types'

const { requests, isLoading, error, refresh } = usePaymentRequests()
const { gridState } = useDataGrid()
const { mutateAsync: submitRequest, isPending: isSubmitting } = useSubmitPaymentRequest()

async function handleAction(request: PaymentRequest) {
  if (request.status === 'DRAFT') {
    if (confirm('Are you sure you want to submit this request for approval?')) {
      await submitRequest(request.id)
      refresh()
    }
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Payment Requests</h1>
        <p class="text-sm text-neutral-500">Manage vendor payments and internal reimbursements.</p>
      </div>
      <Button variant="default"> New Request </Button>
    </header>

    <DataGrid
      v-model:sorting="gridState.sorting"
      v-model:row-selection="gridState.rowSelection"
      v-model:column-visibility="gridState.columnVisibility"
      v-model:global-filter="gridState.globalFilter"
      :data="requests || []"
      :columns="paymentRequestColumns"
      :loading="isLoading"
    >
      <template #actions="{ row }">
        <Button
          v-if="row.original.status === 'DRAFT'"
          size="sm"
          variant="outline"
          @click.stop="handleAction(row.original)"
          :disabled="isSubmitting"
        >
          Submit
        </Button>
      </template>
    </DataGrid>
  </div>
</template>
