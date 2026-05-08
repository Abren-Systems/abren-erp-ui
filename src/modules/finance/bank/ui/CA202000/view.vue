<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { useBankAccountController } from './controller'
import { AppButton, AppInput, AppSelect } from '@/shared/components/primitives'

const props = defineProps<{ id: string }>()
const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any

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
    <template>
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

      <template>
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
