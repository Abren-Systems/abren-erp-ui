<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppButton, AppInput, AppSelect, AppSidePane } from '@/shared/components/primitives'
import { useLedgerAccounts } from '../../../application/useLedgerAccounts'
import { AccountType } from '../../../domain/account.types'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', val: boolean): void }>()

const { accounts, createAccount, isCreating } = useLedgerAccounts()

const form = ref({
  name: '',
  code: null as number | null,
  account_type: 'ASSET',
  parent_id: null as string | null,
})

const accountTypes = [
  { label: 'Asset', value: AccountType.ASSET },
  { label: 'Liability', value: AccountType.LIABILITY },
  { label: 'Equity', value: AccountType.EQUITY },
  { label: 'Revenue', value: AccountType.REVENUE },
  { label: 'Expense', value: AccountType.EXPENSE },
]

// Transform accounts for AppSelect
const parentOptions = computed(() => {
  const opts = accounts.value.map((acc) => ({
    label: `${acc.code} - ${acc.name}`,
    value: acc.id,
  }))
  return [{ label: 'None (Top Level Account)', value: 'none' }, ...opts]
})

const error = ref<string | null>(null)

const isValid = computed(() => {
  return form.value.name.trim().length > 0 && form.value.code !== null && form.value.code > 0
})

async function handleSubmit() {
  if (!isValid.value) return
  error.value = null

  try {
    await createAccount({
      name: form.value.name,
      code: form.value.code as number,
      account_type: form.value.account_type,
      parent_id:
        !form.value.parent_id || form.value.parent_id === 'none' ? null : form.value.parent_id,
    })

    emit('update:open', false)

    // Reset form
    form.value = {
      name: '',
      code: null,
      account_type: 'ASSET',
      parent_id: null,
    }
  } catch (err: unknown) {
    console.error('Failed to create account:', err)
    error.value =
      ((err as Record<string, unknown>).detail as string) ||
      'Failed to create account. Please check the inputs.'
  }
}
</script>

<template>
  <AppSidePane
    :open="open"
    title="New GL Account"
    description="Create a new account in the Chart of Accounts to organize transactions."
    @update:open="emit('update:open', $event)"
  >
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-2 gap-6">
        <AppInput
          label="Account Code"
          type="number"
          v-model.number="form.code"
          placeholder="e.g. 1010"
          required
        />

        <AppSelect
          label="Account Type"
          v-model="form.account_type"
          :options="accountTypes"
          required
        />
      </div>

      <AppInput label="Account Name" v-model="form.name" placeholder="e.g. Petty Cash" required />

      <div class="space-y-1">
        <AppSelect
          label="Parent Account"
          v-model="form.parent_id"
          :options="parentOptions"
          placeholder="Select parent account..."
        />
        <p class="text-[13px] text-[#605e5c]">Hierarchical rollup for financial reporting.</p>
      </div>

      <div
        v-if="error"
        class="p-3 text-[13px] text-[#a4262c] bg-[#fff8f8] rounded-[2px] border border-[#fde7e9]"
      >
        {{ error }}
      </div>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="emit('update:open', false)"> Cancel </AppButton>
      <AppButton
        variant="primary"
        type="submit"
        :disabled="!isValid || isCreating"
        :loading="isCreating"
        @click="handleSubmit"
      >
        Save Account
      </AppButton>
    </template>
  </AppSidePane>
</template>
