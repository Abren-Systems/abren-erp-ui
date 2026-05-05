<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, AppTemplate } from '@/platform/chrome'
import { useTaxRuleController } from './controller'
import { AppButton, AppInput, AppSelect } from '@/shared/components/primitives'

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

const glAccountOptions = [
  { label: '210100 - VAT Payable', value: '00000000-0000-0000-0000-000000000001' },
  { label: '110500 - VAT Input (Recoverable)', value: '00000000-0000-0000-0000-000000000002' },
  { label: '210200 - Withholding Tax Payable', value: '00000000-0000-0000-0000-000000000003' },
]
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading tax rule...
    </div>

    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.isNew.value ? 'New Tax Rule' : ctrl.entity.value?.name"
        back-route="finance.tax.rules"
      />

      <!-- Detail View -->
      <template v-if="!ctrl.isNew.value">
        <div class="px-6 py-5">
          <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
            <FieldGroup>
              <AppField v-bind="ctrl.fields.name" />
              <AppField v-bind="ctrl.fields.rate" />
            </FieldGroup>
            <FieldGroup>
              <AppField v-bind="ctrl.fields.taxType" />
              <AppField v-bind="ctrl.fields.direction" />
            </FieldGroup>
            <FieldGroup>
              <AppField v-bind="ctrl.fields.glAccountId" />
              <AppField v-bind="ctrl.fields.isActive" />
            </FieldGroup>
          </AppTemplate>
        </div>
      </template>

      <!-- Creation View -->
      <template v-else>
        <div class="flex-1 overflow-y-auto p-6 bg-white">
          <div class="max-w-md space-y-4">
            <AppInput v-model="ctrl.form.value.name" label="Rule Name" required />
            <AppInput
              v-model.number="ctrl.form.value.rate"
              type="number"
              label="Tax Rate (Decimal)"
              required
            />
            <AppSelect
              v-model="ctrl.form.value.tax_type"
              label="Tax Type"
              :options="taxTypeOptions"
              required
            />
            <AppSelect
              v-model="ctrl.form.value.direction"
              label="Statutory Direction"
              :options="directionOptions"
              required
            />
            <AppSelect
              v-model="ctrl.form.value.gl_account_id"
              label="GL Account Mapping"
              :options="glAccountOptions"
              required
            />

            <AppButton :loading="ctrl.isCreating.value" @click="ctrl.handleSubmit" class="mt-4">
              Create Rule
            </AppButton>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
