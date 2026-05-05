<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, AppTemplate } from '@/platform/chrome'
import { useTaxGroupController } from './controller'
import { AppButton, AppInput, AppSelect, AppBadge } from '@/shared/components/primitives'
import { Plus, X } from 'lucide-vue-next'

const props = defineProps<{ id: string }>()
const ctrl = useTaxGroupController(props.id)

const methodOptions = [
  { label: 'Simple (Sum of rates)', value: 'SIMPLE' },
  { label: 'Compound (Tax on Tax)', value: 'COMPOUND' },
]

function getRuleName(id: string) {
  return ctrl.availableRules.value?.find((r) => r.id === id)?.name || id
}
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading tax group...
    </div>

    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.isNew.value ? 'New Tax Group' : ctrl.entity.value?.name"
        back-route="finance.tax.groups"
      />

      <!-- Detail View -->
      <template v-if="!ctrl.isNew.value">
        <div class="px-6 py-5">
          <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
            <FieldGroup>
              <AppField v-bind="ctrl.fields.name" />
              <AppField v-bind="ctrl.fields.method" />
            </FieldGroup>
            <FieldGroup>
              <AppField v-bind="ctrl.fields.isActive" />
            </FieldGroup>
          </AppTemplate>
        </div>
      </template>

      <!-- Creation View -->
      <template v-else>
        <div class="flex-1 overflow-y-auto p-6 bg-white">
          <div class="max-w-md space-y-4">
            <AppInput v-model="ctrl.form.value.name" label="Group Name" required />
            <AppSelect
              v-model="ctrl.form.value.method"
              label="Calculation Method"
              :options="methodOptions"
              required
            />

            <div class="grid gap-4 p-4 border rounded bg-neutral-50/50 mt-6">
              <label class="text-sm font-semibold text-neutral-700">Rules in Group</label>
              <div class="flex gap-2">
                <AppSelect
                  v-model="ctrl.selectedRuleId.value"
                  placeholder="Add a rule..."
                  :options="
                    ctrl.availableRules.value?.map((r) => ({
                      label: `${r.name} (${(r.rate * 100).toFixed(1)}%)`,
                      value: r.id,
                      disabled: ctrl.form.value.rule_ids.includes(r.id),
                    })) || []
                  "
                  class="flex-1"
                />
                <AppButton
                  variant="secondary"
                  class="mt-auto h-[32px] w-[32px] p-0"
                  @click="ctrl.addRule"
                  :disabled="!ctrl.selectedRuleId.value"
                >
                  <Plus class="h-4 w-4" />
                </AppButton>
              </div>

              <div class="flex flex-wrap gap-2 pt-2">
                <div
                  v-if="ctrl.form.value.rule_ids.length === 0"
                  class="text-xs text-neutral-400 italic py-2"
                >
                  No rules added yet.
                </div>
                <AppBadge
                  v-for="id in ctrl.form.value.rule_ids"
                  :key="id"
                  variant="secondary"
                  class="flex items-center gap-1 pr-1 py-0.5"
                >
                  {{ getRuleName(id) }}
                  <button
                    class="h-4 w-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                    @click="ctrl.removeRule(id)"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </AppBadge>
              </div>
            </div>

            <AppButton :loading="ctrl.isCreating.value" @click="ctrl.handleSubmit" class="mt-4">
              Create Group
            </AppButton>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
