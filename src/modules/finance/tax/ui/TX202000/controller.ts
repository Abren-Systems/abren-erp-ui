import { computed, ref, toRef } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useTaxRule, useCreateTaxRule } from '../../application/useTaxRules'
import { toId } from '@/shared/types/brand.types'
import type { TaxRuleId } from '@/shared/types/brand.types'
import { TX202000 } from './screen'
import { TX202000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'

export function useTaxRuleController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const ruleId = toRef(() => (isNew.value ? null : toId<TaxRuleId>(id)))

  const { data: rule, isPending: isLoading, error } = useTaxRule(ruleId)
  const { mutateAsync: createRule, isPending: isCreating } = useCreateTaxRule()

  const base = useScreenController({
    screen: TX202000,
    dataSource: { entity: rule, isLoading, error },
    isNew,
  })

  const fields = {
    name: useField(base, TX202000_FIELDS.name),
    rate: useField(base, TX202000_FIELDS.rate),
    taxType: useField(base, TX202000_FIELDS.taxType),
    direction: useField(base, TX202000_FIELDS.direction),
    glAccountId: useField(base, TX202000_FIELDS.glAccountId),
    isActive: useField(base, TX202000_FIELDS.isActive),
  }

  const form = ref({
    name: '',
    rate: 0,
    tax_type: 'VAT' as 'VAT' | 'WHT' | 'TOT' | 'EXCISE' | 'INCOME',
    direction: 'NON_DIRECTIONAL' as 'INPUT' | 'OUTPUT' | 'NON_DIRECTIONAL',
    gl_account_id: '',
    is_active: true,
  })

  async function handleSubmit() {
    await createRule(form.value)
    void router.push({ name: 'finance.tax.rules' })
  }

  return {
    ...base,
    fields,
    form,
    isCreating,
    handleSubmit,
  }
}
