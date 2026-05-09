<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
/**
 * AP301000 — Payment Request Data Entry View
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

const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Error State -->

    <!-- Loading State -->

    <!-- Main Content -->
    <template>
      <!-- 1. Form Title Bar -->

      <!-- 2. Form Toolbar -->

      <!-- 3. Summary Area -->
      <div class="px-6 py-5">
        <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
          <FieldGroup>
            <AppField v-bind="ctrl.fields.requesterId" />
            <AppField
              v-bind="ctrl.fields.beneficiaryId"
              :editor-attrs="{ options: ctrl.userOptions.value }"
            />
            <AppField
              v-bind="ctrl.fields.status"
              type="status"
              :context="{ entity: 'PaymentRequest' }"
            />
          </FieldGroup>

          <FieldGroup>
            <AppField v-bind="ctrl.fields.submittedAt" />
            <AppField v-bind="ctrl.fields.justification" />
          </FieldGroup>

          <FieldGroup>
            <AppField
              v-bind="ctrl.fields.currency"
              :editor-attrs="{ options: ctrl.currencyOptions.value }"
            />
            <AppField v-bind="ctrl.fields.totalAmount" />
          </FieldGroup>
        </AppTemplate>
      </div>

      <!-- 4. Tabs -->
      <div class="px-6">
        <AppTabs :tabs="['Line Details']" v-model="ctrl.activeTab.value" />
      </div>

      <!-- 5. Details Area -->
      <div class="px-6 pb-6">
        <div
          v-if="ctrl.activeTab.value === 'Line Details'"
          class="rounded-lg border border-[var(--color-neutral-200)] overflow-hidden bg-white shadow-sm"
        >
          <DataGrid
            :columns="paymentRequestLineColumns"
            :data="ctrl.currentLines.value"
            :loading="ctrl.isLoading.value && !ctrl.isNew.value"
            empty-message="No line items found"
          />
        </div>
      </div>
    </template>

    <!-- Dialogs -->
    <AuditReasonDialog
      v-model:open="ctrl.isRejectDialogOpen.value"
      v-model="ctrl.auditReason.value"
      title="Reject Payment Request"
      description="Please provide a reason for rejecting this payment request. This will be visible in the audit trail."
      confirm-label="Reject Request"
      placeholder="e.g., Missing documentation, Incorrect amount..."
      @confirm="ctrl.handleRejectConfirm"
    />

    <AuditReasonDialog
      v-model:open="ctrl.isCancelDialogOpen.value"
      v-model="ctrl.auditReason.value"
      title="Cancel Payment Request"
      description="Are you sure you want to cancel this request? Please provide a reason for the record."
      confirm-label="Cancel Request"
      placeholder="e.g., Requested in error, Duplicate submission..."
      @confirm="ctrl.handleCancelConfirm"
    />
  </div>
</template>
