import { computed, watch, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useTaxRule, useCreateTaxRule } from '../../application/useTaxRules'
import { useLedgerAccounts } from '../../../ledger/application/useLedgerAccounts'
import { TX202000 } from './screen'
import { TX202000_POLICY, type TaxRuleStatus } from './policy'
import { TX202000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import type { TaxRule } from '../../domain/tax.types'
import type { TaxRuleId } from '@/shared/types/brand.types'
import type { Account } from '@/modules/finance/ledger/domain/account.types'

const taxRuleSchema = z.object({
  name: z.string().min(1, 'Required'),
  rate: z.number().min(0).max(1),
  tax_type: z.enum(['VAT', 'WHT', 'TOT', 'EXCISE', 'INCOME']),
  direction: z.enum(['OUTPUT', 'INPUT', 'NON_DIRECTIONAL']),
  gl_account_id: z.string().min(1, 'Required'),
  is_active: z.boolean(),
})

type TaxRuleFormValues = z.infer<typeof taxRuleSchema>

export function useTaxRuleController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const ruleId = computed(() => (isNew.value ? null : (id as TaxRuleId)))

  const { data: entity, isLoading, error } = useTaxRule(ruleId)
  const { accounts, isPending: isAccountsLoading } = useLedgerAccounts()
  const { mutateAsync: createRule, isPending: isCreating } = useCreateTaxRule()

  const form = useForm({
    defaultValues: {
      name: '',
      rate: 0,
      tax_type: 'VAT',
      direction: 'OUTPUT',
      gl_account_id: '',
      is_active: true,
    } as TaxRuleFormValues,
    validators: {
      onChange: taxRuleSchema,
    },
    onSubmit: async ({ value }) => {
      if (isNew.value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await createRule(value as any)
        void router.push({ name: 'finance.tax.rules' })
      } else {
        // TODO: Implement update mutation
        console.log('Update not implemented yet', value)
      }
    },
  })

  // Sync server state to form state
  watch(
    entity,
    (newVal) => {
      if (newVal && !isNew.value) {
        form.setFieldValue('name', newVal.name)
        form.setFieldValue('rate', newVal.rate)
        form.setFieldValue('tax_type', newVal.taxType)
        form.setFieldValue('direction', newVal.direction)
        form.setFieldValue('gl_account_id', newVal.glAccountId as string)
        form.setFieldValue('is_active', newVal.isActive)
      }
    },
    { immediate: true },
  )

  const activeEntity = computed(() => {
    const vals = form.state.values
    return {
      name: vals.name,
      rate: vals.rate,
      taxType: vals.tax_type,
      direction: vals.direction,
      glAccountId: vals.gl_account_id,
      isActive: vals.is_active,
    }
  })

  const base = useScreenController<TaxRule, TaxRuleStatus>({
    screen: TX202000,
    dataSource: {
      entity: activeEntity as unknown as ComputedRef<TaxRule>,
      isLoading: computed(() => isLoading.value || isAccountsLoading.value),
      error,
    },
    isNew,
    getDomainState: (ent: TaxRule) => (ent?.isActive ? 'ACTIVE' : 'INACTIVE') as TaxRuleStatus,
    statePolicy: TX202000_POLICY,
  })

  // Attach form to base so useField can find it
  Object.assign(base, { form })

  const fields = {
    name: useField(base, TX202000_FIELDS.name),
    rate: useField(base, TX202000_FIELDS.rate),
    taxType: useField(base, TX202000_FIELDS.taxType),
    direction: useField(base, TX202000_FIELDS.direction),
    glAccountId: useField(base, TX202000_FIELDS.glAccountId),
    isActive: useField(base, TX202000_FIELDS.isActive),
  }

  const handleSave = async () => {
    void form.handleSubmit()
  }

  const accountOptions = computed(
    () =>
      accounts.value?.map((acc: Account) => ({
        label: `${acc.code} - ${acc.name}`,
        value: acc.id,
      })) || [],
  )

  return {
    ...base,
    fields,
    accountOptions,
    isCreating,
    handleSave,
  }
}
