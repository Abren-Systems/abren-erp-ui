<script setup lang="ts">
import { ref } from 'vue'
import { AppDrawer, AppButton, AppInput, AppSelect, AppBadge } from '@/shared/components/primitives'
import { X, Plus } from 'lucide-vue-next'
import { useCreateTaxGroup, useActiveTaxRules } from '../../../application/useTaxRules'
import type { TaxGroupCreateDTO } from '../../../infrastructure/api.types'

/**
 * Drawer: Create Tax Group.
 *
 * Orchestrates the tax group creation form.
 * Allows selecting multiple tax rules and defining the calculation method.
 */
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { mutateAsync: createGroup, isPending } = useCreateTaxGroup()
const { data: availableRules } = useActiveTaxRules()

const form = ref<TaxGroupCreateDTO>({
  name: '',
  method: 'SIMPLE',
  rule_ids: [],
})

const selectedRuleId = ref('')

const methodOptions = [
  { label: 'Simple (Sum of rates)', value: 'SIMPLE' },
  { label: 'Compound (Tax on Tax)', value: 'COMPOUND' },
]

function addRule() {
  if (selectedRuleId.value && !form.value.rule_ids.includes(selectedRuleId.value)) {
    form.value.rule_ids.push(selectedRuleId.value)
    selectedRuleId.value = ''
  }
}

function removeRule(id: string) {
  form.value.rule_ids = form.value.rule_ids.filter((ruleId) => ruleId !== id)
}

function getRuleName(id: string) {
  return availableRules.value?.find((r) => r.id === id)?.name || id
}

async function handleSubmit() {
  if (form.value.rule_ids.length === 0) {
    alert('Please select at least one tax rule.')
    return
  }

  try {
    await createGroup(form.value)
    emit('update:open', false)
    // Reset form
    form.value = {
      name: '',
      method: 'SIMPLE',
      rule_ids: [],
    }
  } catch (error) {
    console.error('Failed to create tax group:', error)
  }
}
</script>

<template>
  <AppDrawer
    :open="props.open"
    title="New Tax Group"
    description="Combine multiple tax rules into a single group for complex calculations."
    size="md"
    @update:open="emit('update:open', $event)"
  >
    <div class="grid gap-6 py-4 px-1">
      <AppInput v-model="form.name" label="Group Name" placeholder="e.g. VAT + Excise" required />

      <AppSelect
        v-model="form.method"
        label="Calculation Method"
        :options="methodOptions"
        required
      />
      <p class="text-[11px] text-muted-foreground -mt-5">
        {{
          form.method === 'COMPOUND'
            ? 'Compound: Each tax is applied to the (base + previous taxes).'
            : 'Simple: All taxes are applied to the same base amount.'
        }}
      </p>

      <div class="grid gap-4 p-4 border rounded bg-neutral-50/50">
        <label class="text-sm font-semibold text-neutral-700">Rules in Group</label>

        <div class="flex gap-2">
          <AppSelect
            v-model="selectedRuleId"
            placeholder="Add a rule..."
            :options="
              availableRules?.map((r) => ({
                label: `${r.name} (${(r.rate * 100).toFixed(1)}%)`,
                value: r.id,
                disabled: form.rule_ids.includes(r.id),
              })) || []
            "
            class="flex-1"
          />
          <AppButton
            variant="secondary"
            class="mt-auto h-[32px] w-[32px] p-0"
            @click="addRule"
            :disabled="!selectedRuleId"
          >
            <Plus class="h-4 w-4" />
          </AppButton>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          <div v-if="form.rule_ids.length === 0" class="text-xs text-neutral-400 italic py-2">
            No rules added yet.
          </div>
          <AppBadge
            v-for="id in form.rule_ids"
            :key="id"
            variant="secondary"
            class="flex items-center gap-1 pr-1 py-0.5"
          >
            {{ getRuleName(id) }}
            <button
              class="h-4 w-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
              @click="removeRule(id)"
            >
              <X class="h-3 w-3" />
            </button>
          </AppBadge>
        </div>
      </div>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="emit('update:open', false)"> Cancel </AppButton>
      <AppButton :loading="isPending" @click="handleSubmit"> Create Group </AppButton>
    </template>
  </AppDrawer>
</template>
