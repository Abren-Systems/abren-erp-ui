<script setup lang="ts">
import { computed } from 'vue'
import { AppSelect } from '@/shared/components/primitives'
import { useLedgerAccounts } from '@/modules/finance/ledger/application/composables/useLedgerAccounts'

interface Props {
  modelValue: string | null
  label?: string
  placeholder?: string
  disabled?: boolean
  accountType?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  required?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { accounts, isPending } = useLedgerAccounts()

const filteredAccounts = computed(() => {
  if (!accounts.value) return []
  if (!props.accountType) return accounts.value
  return accounts.value.filter((a) => a.accountType === props.accountType)
})

const options = computed(() => {
  const opts = filteredAccounts.value.map((acc) => ({
    label: `${acc.code} - ${acc.name}`,
    value: acc.id,
  }))
  return opts
})

function handleChange(val: string) {
  emit('update:modelValue', val)
}
</script>

<template>
  <AppSelect
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder || 'Select GL Account...'"
    :options="options"
    :disabled="disabled || isPending"
    :required="required"
    @update:model-value="handleChange"
  />
</template>
