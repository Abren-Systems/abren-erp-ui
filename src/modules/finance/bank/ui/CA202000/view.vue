<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { useBankAccountController } from './controller'
import { AppButton, AppInput, AppSelect } from '@/shared/components/primitives'

const props = defineProps<{ id: string }>()
const ctrl = useBankAccountController(props.id)

const currencyOptions = [
  { label: 'ETB', value: 'ETB' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
]

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Frozen', value: 'FROZEN' },
]
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading bank account...
    </div>

    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.isNew.value ? 'New Bank Account' : ctrl.entity.value?.accountName"
        back-route="finance.bank.accounts"
      />

      <FormToolbar
        v-if="!ctrl.isNew.value"
        :commands="ctrl.screen.commands"
        :domain-state="String(ctrl.state.domain)"
        :executors="ctrl.commands.value"
        :is-pending="ctrl.isPending.value"
        :is-new="ctrl.isNew.value"
      />

      <template v-if="!ctrl.isNew.value">
        <div class="px-6 py-5">
          <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
            <FieldGroup>
              <AppField v-bind="ctrl.fields.accountName" />
              <AppField v-bind="ctrl.fields.accountNumber" />
            </FieldGroup>
            <FieldGroup>
              <AppField v-bind="ctrl.fields.bankName" />
              <AppField v-bind="ctrl.fields.currency" />
            </FieldGroup>
            <FieldGroup>
              <AppField v-bind="ctrl.fields.status" />
              <AppField v-bind="ctrl.fields.isDefault" />
            </FieldGroup>
          </AppTemplate>
        </div>
      </template>

      <template v-else>
        <div class="flex-1 overflow-y-auto p-6 bg-white">
          <div class="max-w-md space-y-4">
            <AppInput v-model="ctrl.form.value.accountName" label="Account Name" required />
            <AppInput v-model="ctrl.form.value.accountNumber" label="Account Number" required />
            <AppInput v-model="ctrl.form.value.bankName" label="Bank Name" required />
            <AppSelect
              v-model="ctrl.form.value.currency"
              label="Currency"
              :options="currencyOptions"
              required
            />
            <AppSelect
              v-model="ctrl.form.value.status"
              label="Status"
              :options="statusOptions"
              required
            />

            <div class="flex items-center gap-2 mt-4">
              <input type="checkbox" id="isDefault" v-model="ctrl.form.value.isDefault" />
              <label for="isDefault" class="text-sm">Default Account</label>
            </div>

            <AppButton :loading="ctrl.isCreating.value" @click="ctrl.handleSubmit" class="mt-6">
              Create Bank Account
            </AppButton>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
