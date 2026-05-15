<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup, AppTabs } from '@/shared/components/field-system'
import { DataGrid } from '@/shared/components/data-grid'
import { vendorBillLineColumns } from './grids/lines.grid'

import { AppButton } from '@/shared/components/primitives'
import { Plus } from 'lucide-vue-next'

const props = defineProps<{ id: string }>()

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <!-- Loading State -->

    <!-- Main Content -->
    <div class="px-[var(--layout-gutter)] py-3">
      <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
        <!-- Column 1 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.vendorId" />
          <AppField v-bind="ctrl.fields.vendorInvoiceNumber" />
          <AppField v-bind="ctrl.fields.currency" />
          <AppField v-bind="ctrl.fields.whtTotal" />
          <AppField v-bind="ctrl.fields.netPayable" />
        </FieldGroup>

        <!-- Column 2 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.issueDate" />
          <AppField v-bind="ctrl.fields.dueDate" />
          <AppField v-bind="ctrl.fields.totalPaid" />
          <AppField v-bind="ctrl.fields.totalWithheld" />
        </FieldGroup>

        <!-- Column 3 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.status" :context="{ entity: 'VendorBill' }" />
          <AppField v-bind="ctrl.fields.totalAmount" />
        </FieldGroup>
      </AppTemplate>

      <div class="mt-3">
        <FieldGroup :columns="1">
          <AppField v-bind="ctrl.fields.justification" />
        </FieldGroup>
      </div>
    </div>

    <div class="px-[var(--layout-gutter)]">
      <AppTabs :tabs="['Expense Lines']" v-model="ctrl.activeTab" />
    </div>

    <div class="px-[var(--layout-gutter)] pb-6 flex-1 overflow-hidden">
      <div
        v-if="ctrl.activeTab === 'Expense Lines'"
        class="h-full rounded-lg border border-[var(--color-neutral-200)] bg-[var(--app-surface)] shadow-sm flex flex-col"
      >
        <DataGrid
          :columns="vendorBillLineColumns"
          :data="ctrl.currentLines"
          :loading="ctrl.isLoading"
          empty-message="No expense lines found"
        />
      </div>
    </div>

    <!-- Dialogs -->
  </div>
</template>
