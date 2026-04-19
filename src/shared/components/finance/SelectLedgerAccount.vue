<script setup lang="ts">
import { computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { useLedgerAccounts } from '@/modules/finance/ledger/application/composables/useLedgerAccounts'

interface Props {
  modelValue: string | null
  placeholder?: string
  disabled?: boolean
  accountType?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { accounts, isPending } = useLedgerAccounts()

const filteredAccounts = computed(() => {
  if (!accounts.value) return []
  if (!props.accountType) return accounts.value
  return accounts.value.filter((a) => a.accountType === props.accountType)
})

function handleChange(val: string) {
  emit('update:modelValue', val === 'none' ? null : val)
}
</script>

<template>
  <Select
    :model-value="modelValue ?? 'none'"
    @update:model-value="handleChange"
    :disabled="disabled || isPending"
  >
    <SelectTrigger class="w-full">
      <SelectValue :placeholder="placeholder || 'Select GL Account...'" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">None</SelectItem>
      <SelectItem v-for="acc in filteredAccounts" :key="acc.id" :value="acc.id">
        <span class="font-mono text-[10px] bg-neutral-100 px-1 rounded mr-2">{{ acc.code }}</span>
        <span>{{ acc.name }}</span>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
