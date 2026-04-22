<script setup lang="ts">
import { useLedgerSettings } from '../../../application/composables/useLedgerSettings'
import { useLedgerAccounts } from '../../../application/composables/useLedgerAccounts'
import { usePermissions } from '@/shared/auth/usePermissions'
import { AppButton, AppSelect } from '@/shared/components/primitives'
import { watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'

const { hasPermission } = usePermissions()
const canEdit = hasPermission('ledger:manage_accounts')

const { settings, isLoading, updateSettings } = useLedgerSettings()
const { accounts, isPending: isAccountsLoading } = useLedgerAccounts()

const ledgerSettingsSchema = z.object({
  default_bridge_account_id: z.string(),
  pr_payable_account_id: z.string(),
})

type LedgerSettingsFormValues = z.infer<typeof ledgerSettingsSchema>

const form = useForm({
  defaultValues: {
    default_bridge_account_id: '',
    pr_payable_account_id: '',
  } as LedgerSettingsFormValues,
  validators: {
    onChange: ledgerSettingsSchema,
  },
  onSubmit: async ({ value }) => {
    await updateSettings({
      default_bridge_account_id: value.default_bridge_account_id || null,
      pr_payable_account_id: value.pr_payable_account_id || null,
    })
  },
})

// Sync server state to form state
watch(
  settings,
  (newVal) => {
    if (newVal) {
      form.setFieldValue('default_bridge_account_id', newVal.default_bridge_account_id || '')
      form.setFieldValue('pr_payable_account_id', newVal.pr_payable_account_id || '')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex h-full flex-col bg-[var(--app-canvas)]">
    <!-- Page Header -->
    <div
      class="flex shrink-0 items-center justify-between px-8 py-6 bg-white border-b border-[var(--color-neutral-200)]"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 bg-[var(--color-primary-50)] rounded-sm">
          <Settings2 class="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div>
          <h1 class="m-0 text-xl font-bold tracking-tight text-[var(--color-neutral-900)]">
            Ledger Settings
          </h1>
          <p class="mt-1 text-sm text-[var(--color-neutral-500)]">
            Configure global reconciliation and subledger accounts.
          </p>
        </div>
      </div>

      <div v-if="canEdit" class="flex items-center gap-2">
        <AppButton variant="primary" :disabled="isLoading" @click="form.handleSubmit">
          {{ isLoading ? 'Saving...' : 'Save Settings' }}
        </AppButton>
      </div>
    </div>

    <!-- Settings Canvas -->
    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-2xl mx-auto space-y-8">
        <div
          class="bg-white p-8 rounded-sm border border-[var(--color-neutral-200)] shadow-sm space-y-8"
        >
          <h2
            class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)] border-b pb-4 -mx-8 px-8"
          >
            Account Mappings
          </h2>

          <template v-if="!isAccountsLoading && accounts && accounts.length === 0">
            <div
              class="bg-[var(--color-danger-50)] text-[var(--color-danger-900)] border border-[var(--color-danger-200)] rounded-sm p-6 space-y-4"
            >
              <div class="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                <AlertCircle :size="16" />
                <span>Missing Prerequisites</span>
              </div>
              <p class="text-sm leading-relaxed">
                Your Chart of Accounts must be established before you can configure ledger mappings.
                Without accounts, the system cannot reconcile or accrue transactions.
              </p>
              <router-link :to="{ name: 'LedgerCoa' }" class="block">
                <AppButton
                  variant="outline"
                  class="text-[var(--color-danger-900)] border-[var(--color-danger-300)] hover:bg-[var(--color-danger-100)]"
                >
                  Setup Chart of Accounts <ArrowRight :size="14" class="ml-2" />
                </AppButton>
              </router-link>
            </div>
          </template>

          <form
            v-else
            @submit.prevent="
              (e) => {
                e.stopPropagation()
                form.handleSubmit()
              }
            "
            class="space-y-8"
          >
            <form.Field name="default_bridge_account_id">
              <template #default="{ field }">
                <AppSelect
                  label="Default Bridge Account"
                  :model-value="field.state.value"
                  :disabled="isLoading || !canEdit"
                  :options="
                    accounts?.map((acc) => ({
                      label: `${acc.code} - ${acc.name}`,
                      value: acc.id,
                    })) || []
                  "
                  description="Used for temporary holding during multi-step reconciliations."
                  @update:model-value="field.handleChange"
                />
              </template>
            </form.Field>

            <form.Field name="pr_payable_account_id">
              <template #default="{ field }">
                <AppSelect
                  label="PR Payable Account"
                  :model-value="field.state.value"
                  :disabled="isLoading || !canEdit"
                  :options="
                    accounts?.map((acc) => ({
                      label: `${acc.code} - ${acc.name}`,
                      value: acc.id,
                    })) || []
                  "
                  description="Default liability account for Payment Request accruals."
                  @update:model-value="field.handleChange"
                />
              </template>
            </form.Field>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
