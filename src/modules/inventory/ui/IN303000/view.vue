<script setup lang="ts">
import { AppInput, AppSelect, AppButton } from '@/shared/components/primitives'
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar } from '@/platform/chrome'
import { Plus, Trash2 } from 'lucide-vue-next'
import { useAdjustmentController } from './controller'

const props = defineProps<{ id: string }>()
const ctrl = useAdjustmentController(props.id)

const valuationOptions = [
  { label: 'WAC Auto', value: 'auto' },
  { label: 'Manual Override', value: 'manual' },
]
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <FormTitleBar
      :form-title="ctrl.screen.titleKey"
      :record-title="ctrl.isNew.value ? 'New Adjustment' : ctrl.entity.value?.id.slice(0, 8)"
      back-route="inventory.adjustments"
    />

    <FormToolbar @save="ctrl.handlePost" />

    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading adjustment...
    </div>

    <template v-else>
      <div class="flex-1 overflow-y-auto p-8">
        <div class="max-w-4xl mx-auto space-y-6">
          <!-- General Info -->
          <div class="p-6 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm">
            <FieldGroup>
              <AppField
                v-bind="ctrl.fields.warehouse_id"
                :options="ctrl.warehouseOptions.value"
                placeholder="Select Warehouse"
              />
              <AppField v-bind="ctrl.fields.reason" />
            </FieldGroup>
          </div>

          <!-- Line Items Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2
                class="text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-600)]"
              >
                Adjustment Lines
              </h2>
              <AppButton
                v-if="ctrl.state.isEditable"
                type="button"
                variant="outline"
                @click="ctrl.addLine"
              >
                <Plus :size="14" class="mr-2" /> Add Line
              </AppButton>
            </div>

            <div class="space-y-4">
              <div
                v-for="(line, index) in ctrl.form.getFieldValue('lines')"
                :key="index"
                class="grid grid-cols-12 gap-4 items-end p-5 bg-white rounded-sm border border-[var(--color-neutral-200)] shadow-sm"
              >
                <div class="col-span-12 md:col-span-5 space-y-1.5">
                  <label
                    class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                    >Stock Item ID</label
                  >
                  <AppInput
                    v-model="line.stock_item_id"
                    placeholder="UUID..."
                    :disabled="!ctrl.state.isEditable"
                  />
                </div>

                <div class="col-span-6 md:col-span-2 space-y-1.5">
                  <label
                    class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                    >Delta</label
                  >
                  <AppInput
                    type="number"
                    v-model.number="line.quantity_delta"
                    :disabled="!ctrl.state.isEditable"
                  />
                </div>

                <div class="col-span-6 md:col-span-3 space-y-1.5">
                  <label
                    class="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)]"
                    >Valuation</label
                  >
                  <AppSelect
                    v-model="line.valuation_strategy"
                    :options="valuationOptions"
                    :disabled="!ctrl.state.isEditable"
                  />
                </div>

                <div class="col-span-12 md:col-span-2 text-right">
                  <AppButton
                    v-if="ctrl.state.isEditable"
                    type="button"
                    variant="stealth"
                    @click="ctrl.removeLine(index)"
                    :disabled="ctrl.form.getFieldValue('lines').length === 1"
                  >
                    <Trash2 :size="16" class="text-[var(--color-danger-600)]" />
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
