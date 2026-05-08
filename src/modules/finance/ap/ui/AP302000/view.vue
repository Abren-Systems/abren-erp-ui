<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup, AppTabs } from '@/shared/components/field-system'
import { DataGrid } from '@/shared/components/data-grid'
import { AuditReasonDialog } from '@/shared/components/dialog'
import { vendorBillLineColumns } from './grids/lines.grid'
import { useVendorBillController } from './controller'
import { AppButton } from '@/shared/components/primitives'
import { Plus } from 'lucide-vue-next'

const props = defineProps<{ id: string }>()

const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Loading State -->

    <!-- Main Content -->
    <template>
      <!-- Detail View -->
      <template v-if="!ctrl.isNew.value">
        <div class="px-6 py-5">
          <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
            <FieldGroup>
              <AppField v-bind="ctrl.fields.vendorId" />
              <AppField v-bind="ctrl.fields.vendorInvoiceNumber" />
              <AppField v-bind="ctrl.fields.currency" />
            </FieldGroup>
            <FieldGroup>
              <AppField v-bind="ctrl.fields.issueDate" />
              <AppField v-bind="ctrl.fields.dueDate" />
            </FieldGroup>
            <FieldGroup>
              <AppField v-bind="ctrl.fields.status" :context="{ entity: 'VendorBill' }" />
              <AppField v-bind="ctrl.fields.totalAmount" />
            </FieldGroup>
          </AppTemplate>

          <div class="mt-4 max-w-3xl">
            <AppField v-bind="ctrl.fields.justification" />
          </div>
        </div>

        <div class="px-6">
          <AppTabs :tabs="['Expense Lines']" v-model="ctrl.activeTab.value" />
        </div>

        <div class="px-6 pb-6 flex-1 overflow-hidden">
          <div
            v-if="ctrl.activeTab.value === 'Expense Lines'"
            class="h-full rounded-lg border border-[var(--color-neutral-200)] bg-white shadow-sm flex flex-col"
          >
            <DataGrid
              :columns="vendorBillLineColumns"
              :data="ctrl.currentLines.value"
              :loading="ctrl.isLoading.value"
              empty-message="No expense lines found"
            />
          </div>
        </div>
      </template>

      <!-- Creation View Fallback -->
      <template>
        <div class="flex-1 overflow-y-auto p-6 bg-white">
          <p class="text-sm text-neutral-500 mb-4">
            (Form rendering delegated to TanStack Form. In a fully unified system, AppField supports
            edit mode directly).
          </p>
          <ctrl.form.Subscribe v-slot="state">
            <AppButton
              variant="primary"
              :disabled="!state.canSubmit || state.isSubmitting"
              @click="() => ctrl.form.handleSubmit()"
            >
              <template #start>
                <Plus :size="14" />
              </template>
              {{ state.isSubmitting ? 'Registering...' : 'Register Bill' }}
            </AppButton>
          </ctrl.form.Subscribe>
        </div>
      </template>
    </template>

    <!-- Dialogs -->
    <AuditReasonDialog
      v-model:open="ctrl.isRejectDialogOpen.value"
      v-model="ctrl.auditReason.value"
      title="Reject/Void Vendor Bill"
      description="Please provide a reason for voiding this vendor bill. This will be recorded in the audit trail."
      confirm-label="Void Bill"
      @confirm="ctrl.handleRejectConfirm"
    />
  </div>
</template>
