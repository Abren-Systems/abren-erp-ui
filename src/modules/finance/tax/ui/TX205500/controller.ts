import { computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScreenController } from '@/platform/screen-runtime'
import { useTaxGroup, useCreateTaxGroup, useActiveTaxRules } from '../../application/useTaxRules'
import { TX205500 } from './screen'
import { TX205500_POLICY, type TaxGroupStatus } from './policy'
import { TX205500_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings/useField'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import type { TaxRule, CalculationMethod } from '../../models/tax.types'
import type { TaxGroupId } from '@/shared/types/brand.types'

const taxGroupSchema = z.object({
  name: z.string().min(1, 'Required'),
  method: z.enum(['SIMPLE', 'COMPOUND']),
  rule_ids: z.array(z.string()).min(1, 'At least one rule is required'),
  is_active: z.boolean(),
})

type TaxGroupFormValues = z.infer<typeof taxGroupSchema>

/** Form-projection entity shape passed to the screen controller */
interface TaxGroupFormEntity {
  name: string
  method: CalculationMethod
  ruleIds: string[]
  isActive: boolean
}

export function useTaxGroupController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')
  const groupId = computed(() => (isNew.value ? null : (id as TaxGroupId)))

  const { data: entity, isLoading, error } = useTaxGroup(groupId)
  const { data: availableRules, isLoading: isRulesLoading } = useActiveTaxRules()
  const { mutateAsync: createGroup, isPending: isCreating } = useCreateTaxGroup()

  const form = useForm({
    defaultValues: {
      name: '',
      method: 'SIMPLE',
      rule_ids: [],
      is_active: true,
    } as TaxGroupFormValues,
    validators: {
      onChange: taxGroupSchema,
    },
    onSubmit: async ({ value }) => {
      if (isNew.value) {
        await createGroup(value)
        void router.push({ name: 'TaxGroupsList' })
      } else {
        // TODO: Implement update mutation
        console.warn('[TODO] Update not yet implemented', value)
      }
    },
  })

  // Sync server state to form state
  watch(
    entity,
    (newVal) => {
      if (newVal && !isNew.value) {
        form.setFieldValue('name', newVal.name)
        form.setFieldValue('method', newVal.method)
        form.setFieldValue('rule_ids', newVal.ruleIds as string[])
        form.setFieldValue('is_active', newVal.isActive)
      }
    },
    { immediate: true },
  )

  const activeEntity = computed<TaxGroupFormEntity | null>(() => {
    const vals = form.state.values
    return {
      name: vals.name,
      method: vals.method,
      ruleIds: vals.rule_ids,
      isActive: vals.is_active,
    }
  })

  const base = useScreenController<TaxGroupFormEntity, TaxGroupStatus>({
    screen: TX205500,
    dataSource: {
      entity: activeEntity,
      isLoading: computed(() => isLoading.value || isRulesLoading.value),
      error,
    },
    isNew,
    getDomainState: (ent) => (ent?.isActive ? 'ACTIVE' : 'INACTIVE') as TaxGroupStatus,
    statePolicy: TX205500_POLICY,
  })

  // Attach form to base so useField can find it
  Object.assign(base, { form })

  const fields = {
    name: useField(base, TX205500_FIELDS.name),
    method: useField(base, TX205500_FIELDS.method),
    isActive: useField(base, TX205500_FIELDS.isActive),
  }

  const selectedRuleId = ref('')

  const handleAddRule = () => {
    const currentRules = form.getFieldValue('rule_ids')
    if (selectedRuleId.value && !currentRules.includes(selectedRuleId.value)) {
      form.setFieldValue('rule_ids', [...currentRules, selectedRuleId.value])
      selectedRuleId.value = ''
    }
  }

  const handleRemoveRule = (ruleId: string) => {
    const currentRules = form.getFieldValue('rule_ids')
    form.setFieldValue(
      'rule_ids',
      currentRules.filter((id) => id !== ruleId),
    )
  }

  const handleSave = async () => {
    void form.handleSubmit()
  }

  const ruleOptions = computed(
    () =>
      availableRules.value?.map((r: TaxRule) => ({
        label: `${r.name} (${(r.rate * 100).toFixed(1)}%)`,
        value: r.id,
      })) || [],
  )

  const selectedRules = computed(() => {
    const currentIds = form.getFieldValue('rule_ids')
    return (
      availableRules.value?.filter((r) => (currentIds as string[]).includes(r.id as string)) || []
    )
  })

  return {
    ...base,
    fields,
    ruleOptions,
    selectedRules,
    selectedRuleId,
    isCreating,
    handleAddRule,
    handleRemoveRule,
    handleSave,
  }
}
