<script setup lang="ts">
import { ref } from 'vue'
import {
  AppDrawer,
  AppButton,
  AppInput,
  AppSelect,
} from '@/shared/components/primitives'
import { useCreateTaxRule } from '../../../application/useTaxRules'
import type { TaxRuleCreateDTO } from '../../../infrastructure/api.types'

/**
 * Drawer: Create Tax Rule.
 *
 * Orchestrates the tax rule creation form with statutory directionality support.
 */
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { mutateAsync: createRule, isPending } = useCreateTaxRule()

const form = ref<TaxRuleCreateDTO>({
  name: '',
  rate: 0,
  tax_type: 'VAT',
  direction: 'NON_DIRECTIONAL',
  gl_account_id: '',
})

const taxTypeOptions = [
  { label: 'Value Added Tax (VAT)', value: 'VAT' },
  { label: 'Withholding Tax (WHT)', value: 'WHT' },
]

const directionOptions = [
  { label: 'Output (Sales)', value: 'OUTPUT' },
  { label: 'Input (Purchases)', value: 'INPUT' },
  { label: 'Non-Directional', value: 'NON_DIRECTIONAL' },
]

// Mock GL accounts for now - in production these would come from Ledger module
const glAccountOptions = [
  { label: '210100 - VAT Payable', value: '00000000-0000-0000-0000-000000000001' },
  { label: '110500 - VAT Input (Recoverable)', value: '00000000-0000-0000-0000-000000000002' },
  { label: '210200 - Withholding Tax Payable', value: '00000000-0000-0000-0000-000000000003' },
]

async function handleSubmit() {
  try {
    await createRule(form.value)
    emit('update:open', false)
    // Reset form
    form.value = {
      name: '',
      rate: 0,
      tax_type: 'VAT',
      direction: 'NON_DIRECTIONAL',
      gl_account_id: '',
    }
  } catch (error) {
    console.error('Failed to create tax rule:', error)
  }
}
</script>

<template>
  <AppDrawer
    :open="props.open"
    title="New Tax Rule"
    description="Configure a new tax rate for the system."
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <div class="grid gap-4 py-4">
      <AppInput
        v-model="form.name"
        label="Rule Name"
        placeholder="e.g. Standard VAT 15%"
        required
      />

      <AppInput
        v-model.number="form.rate"
        type="number"
        label="Tax Rate (Decimal)"
        placeholder="0.15"
        required
      />
      <p class="text-[11px] text-muted-foreground -mt-3">
        Enter as decimal (e.g. 0.15 for 15%)
      </p>

      <AppSelect
        v-model="form.tax_type"
        label="Tax Type"
        :options="taxTypeOptions"
        required
      />

      <AppSelect
        v-model="form.direction"
        label="Statutory Direction"
        :options="directionOptions"
        required
      />

      <AppSelect
        v-model="form.gl_account_id"
        label="GL Account Mapping"
        :options="glAccountOptions"
        placeholder="Select a GL account"
        required
      />
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="emit('update:open', false)">
        Cancel
      </AppButton>
      <AppButton :loading="isPending" @click="handleSubmit">
        Create Rule
      </AppButton>
    </template>
  </AppDrawer>
</template>
