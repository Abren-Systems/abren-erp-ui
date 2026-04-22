<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { AppButton } from '@/shared/components/primitives'
import { Plus } from 'lucide-vue-next'
import { vendorBillColumns } from '../grids/vendor-bill.grid'
import { useVendorBills } from '../../../application/composables/useVendorBills'
import { usePermissions } from '@/shared/auth/usePermissions'
import type { VendorBill } from '../../../domain/ap.types'

/**
 * Stage 1: Queue — Vendor Bills List Page.
 *
 * Progressive Disclosure flow (UX_ARCHITECTURE.md §2):
 *   THIS PAGE → router.push(VendorBillDetail) → VendorBillDetailPage
 *   THIS PAGE → router.push(VendorBillCreate) → VendorBillCreatePage
 */

const router = useRouter()
const { hasPermission } = usePermissions()
const { bills, isLoading } = useVendorBills()
const { sorting, rowSelection, columnVisibility, globalFilter } = useDataGrid()

function handleRowClick(bill: VendorBill) {
  void router.push({ name: 'VendorBillDetail', params: { id: bill.id } })
}

function handleCreate() {
  void router.push({ name: 'VendorBillCreate' })
}
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]">
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <FileText class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">Vendor Bills</h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Manage inbound supplier invoices and AP accruals.
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <AppButton 
          v-if="hasPermission('ap:create')"
          variant="primary"
          @click="handleCreate"
        >
          <Plus :size="14" class="mr-2" />
          New Bill
        </AppButton>
      </div>
    </div>

    <!-- DataGrid Orchestration -->
    <div class="min-h-0 flex-1 p-8">
      <DataGrid
        v-model:sorting="sorting"
        v-model:row-selection="rowSelection"
        v-model:column-visibility="columnVisibility"
        v-model:global-filter="globalFilter"
        :data="bills ?? []"
        :columns="vendorBillColumns"
        :loading="isLoading"
        placeholder="Search vendor bills..."
        @row-click="handleRowClick"
      />
    </div>
  </div>
</template>
