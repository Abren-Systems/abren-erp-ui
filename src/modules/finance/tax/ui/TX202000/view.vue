<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { useTaxRuleController } from './controller'

const props = defineProps<{ id: string }>()
const ctrl = useTaxRuleController(props.id)

const taxTypeOptions = [
  { label: 'Value Added Tax (VAT)', value: 'VAT' },
  { label: 'Withholding Tax (WHT)', value: 'WHT' },
]

const directionOptions = [
  { label: 'Output (Sales)', value: 'OUTPUT' },
  { label: 'Input (Purchases)', value: 'INPUT' },
  { label: 'Non-Directional', value: 'NON_DIRECTIONAL' },
]
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Header -->
    <FormTitleBar
      :form-title="ctrl.screen.titleKey"
      :record-title="ctrl.isNew.value ? undefined : ctrl.model.value.ui.title"
      back-route="finance.tax.rules"
    />

    <!-- Toolbar -->
    <FormToolbar
      :model="ctrl.model.value"
      :executors="ctrl.commands.value"
      :is-pending="ctrl.isPending.value"
      :is-new="ctrl.isNew.value"
      @save="ctrl.handleSave"
    />

    <!-- Main Content -->
    <div class="px-6 py-5 overflow-y-auto">
      <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
        <FieldGroup title="General Information">
          <AppField v-bind="ctrl.fields.name" />
          <AppField v-bind="ctrl.fields.rate" />
        </FieldGroup>

        <FieldGroup title="Tax Configuration">
          <AppField v-bind="ctrl.fields.taxType" :editor-attrs="{ options: taxTypeOptions }" />
          <AppField v-bind="ctrl.fields.direction" :editor-attrs="{ options: directionOptions }" />
        </FieldGroup>

        <FieldGroup title="Financial Mapping">
          <AppField
            v-bind="ctrl.fields.glAccountId"
            :editor-attrs="{ options: ctrl.accountOptions.value }"
          />
          <AppField v-bind="ctrl.fields.isActive" />
        </FieldGroup>
      </AppTemplate>
    </div>
  </div>
</template>
