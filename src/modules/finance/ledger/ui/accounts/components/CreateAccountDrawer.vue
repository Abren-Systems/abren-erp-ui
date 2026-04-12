<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/shared/components/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { useLedgerAccounts } from '../../../application/composables/useLedgerAccounts'
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
  AccountType.ASSET,
  AccountType.LIABILITY,
  AccountType.EQUITY,
  AccountType.REVENUE,
  AccountType.EXPENSE,
]

async function handleSubmit() {
  if (!form.value.name || !form.value.code) return

  try {
    await createAccount({
      name: form.value.name,
      code: form.value.code,
      account_type: form.value.account_type,
      parent_id: form.value.parent_id,
    })

    emit('update:open', false)

    // Reset form
    form.value = {
      name: '',
      code: null,
      account_type: 'ASSET',
      parent_id: null,
    }
  } catch (err) {
    console.error('Failed to create account:', err)
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="sm:max-w-[450px]">
      <SheetHeader>
        <SheetTitle>New GL Account</SheetTitle>
        <SheetDescription>
          Create a new account in the Chart of Accounts to organize transactions.
        </SheetDescription>
      </SheetHeader>

      <form class="py-6 space-y-6" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="code">Account Code <span class="text-rose-500">*</span></Label>
            <Input id="code" type="number" v-model.number="form.code" placeholder="e.g. 1010" />
          </div>

          <div class="grid gap-2">
            <Label for="type">Account Type <span class="text-rose-500">*</span></Label>
            <Select v-model="form.account_type">
              <SelectTrigger id="type">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in accountTypes" :key="type" :value="type">
                  {{ type.charAt(0) + type.slice(1).toLowerCase() }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="name">Account Name <span class="text-rose-500">*</span></Label>
          <Input id="name" v-model="form.name" placeholder="e.g. Petty Cash" />
        </div>

        <div class="grid gap-2">
          <Label for="parent">Parent Account (Optional)</Label>
          <Select v-model="form.parent_id">
            <SelectTrigger id="parent">
              <SelectValue placeholder="None (Top Level Account)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None (Top Level Account)</SelectItem>
              <SelectItem v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.code }} - {{ acc.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-[13px] text-neutral-500 mt-1">
            Hierarchical rollup for financial reporting.
          </p>
        </div>

        <SheetFooter class="pt-6 border-t mt-6">
          <Button variant="outline" type="button" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button
            variant="default"
            type="submit"
            :disabled="!form.name || !form.code || isCreating"
          >
            {{ isCreating ? 'Creating…' : 'Save Account' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
