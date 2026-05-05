<script setup lang="ts">
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
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { paymentRequestLineColumns } from './grids/lines.grid'
import { usePaymentRequestEntry } from './controller'

const props = defineProps<{ id: string }>()

const ctrl = usePaymentRequestEntry(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Error State -->
    <div v-if="ctrl.error.value" class="p-8">
      <AppFieldset title="Error Loading Request" variant="neutral" :columns="1">
        <AppField field="error" label="Error" :value="String(ctrl.error.value)" type="text" />
      </AppFieldset>
    </div>

    <!-- Loading State -->
    <div v-else-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      <AppFieldset title="Loading" variant="neutral" :columns="1">
        <AppField field="status" label="Status" value="Loading details..." type="text" />
      </AppFieldset>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- 1. Form Title Bar -->
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.isNew.value ? undefined : ctrl.entity.value?.requestNumber"
        back-route="PaymentRequestsList"
      />

      <!-- 2. Form Toolbar -->
      <FormToolbar
        v-if="!ctrl.isNew.value"
        :commands="ctrl.screen.commands"
        :domain-state="String(ctrl.state.domain)"
        :executors="ctrl.commands.value"
        :is-pending="ctrl.isPending.value"
        :is-new="ctrl.isNew.value"
      />

      <!-- Create Mode Toolbar -->
      <div
        v-else
        class="flex items-center gap-2 px-6 py-2 border-b border-[var(--color-neutral-200)] bg-white"
      >
        <AppButton variant="secondary" @click="ctrl.saveDraft"> Save Draft </AppButton>
        <AppButton variant="primary" :disabled="ctrl.isCreating.value" @click="ctrl.handleCreate">
          Create Request
        </AppButton>
      </div>

      <!-- 3. Summary Area -->
      <div class="px-6 py-5">
        <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
          <FieldGroup>
            <AppField v-bind="ctrl.fields.requesterId" />
            <AppField
              v-bind="ctrl.fields.beneficiaryId"
              :mode="ctrl.state.isEditable ? 'edit' : 'read'"
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
            <AppField
              v-bind="ctrl.fields.justification"
              :mode="ctrl.state.isEditable ? 'edit' : 'read'"
            />
          </FieldGroup>

          <FieldGroup>
            <AppField
              v-bind="ctrl.fields.currency"
              :mode="ctrl.state.isEditable ? 'edit' : 'read'"
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
  </div>
</template>
