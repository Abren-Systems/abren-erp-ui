import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useScreenController,
  LIST_SCREEN_POLICY,
  listScreenDomainState,
} from '@/platform/screen-runtime'
import { useCreateTaxGroup, useActiveTaxRules } from '../../application/useTaxRules'
// We don't have a useTaxGroup composable for detail yet, mocking it for completeness
import type { TaxGroup } from '../../domain/tax.types'
import { TX201000 } from './screen'
import { TX201000_FIELDS } from './fields'
import { useField } from '@/platform/field-system/bindings'

export function useTaxGroupController(id: string) {
  const router = useRouter()
  const isNew = computed(() => id === 'new')

  // Mock fetching a single group since API might not have it yet
  const group = ref<TaxGroup | null>(null)
  const isLoading = ref(false)
  const error = ref(null)

  const { data: availableRules } = useActiveTaxRules()
  const { mutateAsync: createGroup, isPending: isCreating } = useCreateTaxGroup()

  const base = useScreenController({
    screen: TX201000,
    dataSource: { entity: group, isLoading, error },
    isNew,
    getDomainState: listScreenDomainState,
    statePolicy: LIST_SCREEN_POLICY,
  })

  const fields = {
    name: useField(base, TX201000_FIELDS.name),
    method: useField(base, TX201000_FIELDS.method),
    isActive: useField(base, TX201000_FIELDS.isActive),
  }

  const form = ref({
    name: '',
    method: 'SIMPLE' as 'SIMPLE' | 'COMPOUND',
    rule_ids: [] as string[],
  })

  const selectedRuleId = ref('')

  function addRule() {
    if (selectedRuleId.value && !form.value.rule_ids.includes(selectedRuleId.value)) {
      form.value.rule_ids.push(selectedRuleId.value)
      selectedRuleId.value = ''
    }
  }

  function removeRule(ruleId: string) {
    form.value.rule_ids = form.value.rule_ids.filter((id) => id !== ruleId)
  }

  async function handleSubmit() {
    if (form.value.rule_ids.length === 0) {
      alert('Please select at least one tax rule.')
      return
    }
    await createGroup(form.value)
    void router.push({ name: 'finance.tax.groups' })
  }

  return {
    ...base,
    fields,
    form,
    isCreating,
    availableRules,
    selectedRuleId,
    addRule,
    removeRule,
    handleSubmit,
  }
}
