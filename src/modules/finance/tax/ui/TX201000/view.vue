<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { useTaxGroupController } from './controller'
import { AppButton, AppSelect, AppBadge } from '@/shared/components/primitives'
import { Plus, X } from 'lucide-vue-next'

const props = defineProps<{ id: string }>()
const ctrl = useTaxGroupController(props.id)

const methodOptions = [
  { label: 'Simple (Sum of rates)', value: 'SIMPLE' },
  { label: 'Compound (Tax on Tax)', value: 'COMPOUND' },
]
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Header -->
    <FormTitleBar
      :form-title="ctrl.screen.titleKey"
      :record-title="ctrl.isNew.value ? undefined : ctrl.model.value.ui.title"
      back-route="finance.tax.groups"
    />

    <!-- Toolbar -->
    <FormToolbar
      :model="ctrl.model.value"
      :executors="ctrl.commands.value"
      :is-pending="ctrl.isPending.value"
      :is-new="ctrl.isNew.value"
      @save="ctrl.handleSave"
    />

    <!-- Main Content -->
    <div class="px-6 py-5 overflow-y-auto">
      <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
        <FieldGroup title="General Information">
          <AppField v-bind="ctrl.fields.name" />
          <AppField v-bind="ctrl.fields.method" :editor-attrs="{ options: methodOptions }" />
          <AppField v-bind="ctrl.fields.isActive" />
        </FieldGroup>

        <FieldGroup title="Tax Rules Mapping">
          <div class="grid gap-4 p-4 border rounded bg-white mt-2">
            <div class="flex gap-2">
              <AppSelect
                v-model="ctrl.selectedRuleId.value"
                placeholder="Add a rule to this group..."
                :options="ctrl.ruleOptions.value"
                class="flex-1"
                :disabled="!ctrl.state.isEditable"
              />
              <AppButton
                variant="secondary"
                class="h-[32px] w-[32px] p-0"
                @click="ctrl.handleAddRule"
                :disabled="!ctrl.selectedRuleId.value || !ctrl.state.isEditable"
              >
                <Plus class="h-4 w-4" />
              </AppButton>
            </div>

            <div class="flex flex-wrap gap-2 pt-2">
              <div
                v-if="ctrl.selectedRules.value.length === 0"
                class="text-xs text-neutral-400 italic py-2"
              >
                No rules added to this group yet.
              </div>
              <AppBadge
                v-for="rule in ctrl.selectedRules.value"
                :key="rule.id"
                variant="secondary"
                class="flex items-center gap-1 pr-1 py-1"
              >
                {{ rule.name }} ({{ (rule.rate * 100).toFixed(1) }}%)
                <button
                  v-if="ctrl.state.isEditable"
                  class="h-4 w-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                  @click="ctrl.handleRemoveRule(rule.id)"
                >
                  <X class="h-3 w-3" />
                </button>
              </AppBadge>
            </div>
          </div>
        </FieldGroup>
      </AppTemplate>
    </div>
  </div>
</template>
