<script setup lang="ts">
import { useLedgerSettings } from '../../application/composables/useLedgerSettings'
import { useLedgerAccounts } from '../../application/composables/useLedgerAccounts'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { Label } from '@/shared/components/label'
import { watch, ref } from 'vue'
import type { components } from '@/shared/api/generated.types'

const { settings, isLoading, updateSettings } = useLedgerSettings()
const { accounts } = useLedgerAccounts()

const form = ref({
  default_bridge_account_id: '',
  pr_payable_account_id: '',
})

watch(
  settings,
  (newVal) => {
    if (newVal) {
      form.value.default_bridge_account_id = newVal.default_bridge_account_id || ''
      form.value.pr_payable_account_id = newVal.pr_payable_account_id || ''
    }
  },
  { immediate: true },
)

const handleSave = async () => {
  await updateSettings({
    default_bridge_account_id: form.value.default_bridge_account_id || null,
    pr_payable_account_id: form.value.pr_payable_account_id || null,
  })
}
</script>

<template>
  <div style="padding: 24px; max-width: 800px; margin: 0 auto">
    <Card>
      <CardHeader>
        <CardTitle>Ledger Settings</CardTitle>
        <CardDescription>Configure global reconciliation and subledger accounts.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-6">
        <div class="grid gap-2">
          <Label for="bridge">Default Bridge Account</Label>
          <Select v-model="form.default_bridge_account_id" :disabled="isLoading">
            <SelectTrigger id="bridge">
              <SelectValue placeholder="Select bridge account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.code }} - {{ acc.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-sm text-muted-foreground">
            Used for temporary holding during multi-step reconciliations.
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="payable">PR Payable Account</Label>
          <Select v-model="form.pr_payable_account_id" :disabled="isLoading">
            <SelectTrigger id="payable">
              <SelectValue placeholder="Select payable account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.code }} - {{ acc.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-sm text-muted-foreground">
            Default liability account for Payment Request accruals.
          </p>
        </div>

        <div class="flex justify-end">
          <Button @click="handleSave" :loading="isLoading">Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
