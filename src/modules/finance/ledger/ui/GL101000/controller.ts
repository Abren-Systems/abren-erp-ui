import { computed, watch, type ComputedRef } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { useLedgerSettings } from '../../application/useLedgerSettings'
import { useLedgerAccounts } from '../../application/useLedgerAccounts'
import { GL101000 } from './screen'
import { GL101000_POLICY, type LedgerSettingsStatus } from './policy'
import { GL101000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import type { components } from '@/shared/api/generated.types'

type LedgerSettingsDTO = components['schemas']['LedgerSettingsDTO']

const ledgerSettingsSchema = z.object({
  default_bridge_account_id: z.string().min(1, 'Required'),
  pr_payable_account_id: z.string().min(1, 'Required'),
})

type LedgerSettingsFormValues = z.infer<typeof ledgerSettingsSchema>

export function useLedgerSettingsController() {
  const { settings, isLoading, error, updateSettings } = useLedgerSettings()
  const { accounts, isPending: isAccountsLoading } = useLedgerAccounts()

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

  const activeEntity = computed(() => {
    return {
      ...form.state.values,
    }
  })

  const base = useScreenController<LedgerSettingsDTO, LedgerSettingsStatus>({
    screen: GL101000,
    dataSource: {
      entity: activeEntity as unknown as ComputedRef<LedgerSettingsDTO>,
      isLoading: computed(() => isLoading.value || isAccountsLoading.value),
      error,
    },
    isNew: computed(() => false),
    getDomainState: () => {
      if (!isAccountsLoading.value && accounts.value?.length === 0) {
        return 'MISSING_PREREQUISITES'
      }
      return 'OPEN'
    },
    statePolicy: GL101000_POLICY,
  })

  base.registerCommand('save', {
    execute: async () => {
      void form.handleSubmit()
    },
    isPending: isLoading,
  })

  const fields = {
    default_bridge_account_id: useField(base, GL101000_FIELDS.default_bridge_account_id),
    pr_payable_account_id: useField(base, GL101000_FIELDS.pr_payable_account_id),
  }

  const accountOptions = computed(
    () =>
      accounts.value?.map((acc) => ({
        label: `${acc.code} - ${acc.name}`,
        value: acc.id,
      })) || [],
  )

  return {
    ...base,
    fields,
    accountOptions,
    form,
  }
}
