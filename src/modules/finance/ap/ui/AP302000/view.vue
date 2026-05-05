<script setup lang="ts">
import { AppField, FieldGroup, AppTabs } from '@/shared/components/field-system'
import { DataGrid } from '@/shared/components/data-grid'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { vendorBillLineColumns } from './grids/lines.grid'
import { useVendorBillController } from './controller'
import { AppButton } from '@/shared/components/primitives'
import { Plus } from 'lucide-vue-next'

const props = defineProps<{ id: string }>()

const ctrl = useVendorBillController(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Loading State -->
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading vendor bill details...
    </div>

    <!-- Main Content -->
    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.isNew.value ? 'New Vendor Bill' : ctrl.entity.value?.billNumber"
        back-route="VendorBillsList"
      />

      <FormToolbar
        v-if="!ctrl.isNew.value"
        :commands="ctrl.screen.commands"
        :domain-state="String(ctrl.state.domain)"
        :executors="ctrl.commands.value"
        :is-pending="ctrl.isPending.value"
        :is-new="ctrl.isNew.value"
      />

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
      <template v-else>
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
  </div>
</template>
