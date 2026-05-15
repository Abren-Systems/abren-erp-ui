<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
/**
 * AP301500 — Payment Request Data Entry View
 *
 * Pure presentation template. All behavior comes from the controller.
 * All chrome comes from platform components (FormTitleBar, FormToolbar).
 *
 * This file should remain thin — layout only, no business logic.
 */
import {
  AppField,
  AppFormField,
  AppFieldset,
  FieldGroup,
  AppTabs,
} from '@/shared/components/field-system'
import { AppButton } from '@/shared/components/primitives'
import { DataGrid } from '@/shared/components/data-grid'
import { AuditReasonDialog } from '@/shared/components/dialog'
import { paymentRequestLineColumns } from './grids/lines.grid'

const props = defineProps<{ id: string }>()

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <!-- Error State -->

    <!-- Loading State -->

    <!-- Main Content -->
    <!-- 1. Form Title Bar -->

    <!-- 2. Form Toolbar -->

    <!-- 3. Summary Area -->
    <div class="px-[var(--layout-gutter)] py-3">
      <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
        <!-- Column 1 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.requesterId" />
          <AppField
            v-bind="ctrl.fields.beneficiaryId"
            :editor-attrs="{ options: ctrl.userOptions }"
          />
        </FieldGroup>

        <!-- Column 2 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.submittedAt" />
          <AppField
            v-bind="ctrl.fields.currency"
            :editor-attrs="{ options: ctrl.currencyOptions }"
          />
        </FieldGroup>

        <!-- Column 3 -->
        <FieldGroup>
          <AppField
            v-bind="ctrl.fields.status"
            type="status"
            :context="{ entity: 'PaymentRequest' }"
          />
          <AppField v-bind="ctrl.fields.totalAmount" />
        </FieldGroup>
      </AppTemplate>

      <div class="mt-3">
        <FieldGroup :columns="1">
          <AppField v-bind="ctrl.fields.justification" />
        </FieldGroup>
      </div>
    </div>

    <!-- 4. Tabs -->
    <div class="px-[var(--layout-gutter)]">
      <AppTabs :tabs="['Line Details']" v-model="ctrl.activeTab" />
    </div>

    <!-- 5. Details Area -->
    <div class="px-[var(--layout-gutter)] pb-6 flex-1 overflow-hidden">
      <div
        v-if="ctrl.activeTab === 'Line Details'"
        class="h-full rounded-lg border border-[var(--color-neutral-200)] bg-[var(--app-surface)] shadow-sm flex flex-col"
      >
        <DataGrid
          :columns="paymentRequestLineColumns"
          :data="ctrl.currentLines"
          :loading="ctrl.isLoading && !ctrl.isNew"
          empty-message="No line items found"
        />
      </div>
    </div>

    <!-- Dialogs -->
    <AuditReasonDialog
      v-model:open="ctrl.isRejectDialogOpen"
      v-model="ctrl.auditReason"
      title="Reject Payment Request"
      description="Please provide a reason for rejecting this payment request. This will be visible in the audit trail."
      confirm-label="Reject Request"
      placeholder="e.g., Missing documentation, Incorrect amount..."
      @confirm="ctrl.handleRejectConfirm"
    />

    <AuditReasonDialog
      v-model:open="ctrl.isCancelDialogOpen"
      v-model="ctrl.auditReason"
      title="Cancel Payment Request"
      description="Are you sure you want to cancel this request? Please provide a reason for the record."
      confirm-label="Cancel Request"
      placeholder="e.g., Requested in error, Duplicate submission..."
      @confirm="ctrl.handleCancelConfirm"
    />
  </div>
</template>
