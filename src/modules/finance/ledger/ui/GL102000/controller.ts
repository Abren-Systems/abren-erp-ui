import { computed, watch } from 'vue'
import { useScreenController } from '@/platform/screen-runtime'
import { useLedgerSettings } from '../../application/useLedgerSettings'
import { useLedgerAccounts } from '../../application/useLedgerAccounts'
import { GL102000 } from './screen'
import { GL102000_POLICY, type LedgerSettingsStatus } from './policy'
import { GL102000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'

const ledgerSettingsSchema = z.object({
  default_bridge_account_id: z.string().min(1, 'Required'),
  pr_payable_account_id: z.string().min(1, 'Required'),
})

type LedgerSettingsFormValues = z.infer<typeof ledgerSettingsSchema>

/** Form-projection entity shape passed to the screen controller */
type LedgerSettingsFormEntity = LedgerSettingsFormValues

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

  const activeEntity = computed<LedgerSettingsFormEntity | null>(() => {
    return { ...form.state.values }
  })

  const base = useScreenController<LedgerSettingsFormEntity, LedgerSettingsStatus>({
    screen: GL102000,
    dataSource: {
      entity: activeEntity,
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
    statePolicy: GL102000_POLICY,
  })

  // Attach form to base so useField can find it
  Object.assign(base, { form })

  const handleSave = async () => {
    void form.handleSubmit()
  }

  const fields = {
    default_bridge_account_id: useField(base, GL102000_FIELDS.default_bridge_account_id),
    pr_payable_account_id: useField(base, GL102000_FIELDS.pr_payable_account_id),
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
    handleSave,
  }
}
