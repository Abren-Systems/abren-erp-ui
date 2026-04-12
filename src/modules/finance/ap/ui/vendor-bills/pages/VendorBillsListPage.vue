<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, useDataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/button'
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
  <div class="flex h-full flex-col gap-5">
    <!-- Page Header -->
    <div class="flex shrink-0 items-start justify-between">
      <div>
        <h1 class="m-0 text-heading text-[var(--color-grid-text)]">
          Vendor Bills
        </h1>
        <p class="mt-1 text-body-sm text-[var(--color-grid-text-muted)]">
          Manage inbound supplier invoices and AP accruals.
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
        :data="bills ?? []"
        :columns="vendorBillColumns"
        :loading="isLoading"
        placeholder="Search vendor bills…"
        row-clickable
        @row-click="handleRowClick"
      >
        <template #toolbar>
          <Button
            v-if="hasPermission('ap:create_bill')"
            size="sm"
            class="h-[26px] px-2.5 text-xs"
            @click="handleCreate"
          >
            <Plus :size="13" class="mr-1" />
            New Bill
          </Button>
        </template>
      </DataGrid>
    </div>
  </div>
</template>
