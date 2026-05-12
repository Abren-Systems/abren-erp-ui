<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup } from '@/shared/components/field-system'

import { AppButton, AppInput, AppSelect } from '@/shared/components/primitives'

const props = defineProps<{ id: string }>()
const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any

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
    <div class="px-[var(--layout-gutter)] py-5">
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
  </div>
</template>
