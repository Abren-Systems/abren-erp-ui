<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { useStockItemController } from './controller'

const props = defineProps<{ id: string }>()
const ctrl = useStockItemController(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <FormTitleBar
      :form-title="ctrl.screen.titleKey"
      :record-title="
        ctrl.isNew.value ? 'New Stock Position' : ctrl.entity.value?.itemId.slice(0, 8)
      "
      back-route="inventory.stock"
    />

    <FormToolbar @save="ctrl.handleSave" />

    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading stock item...
    </div>

    <template v-else>
      <div class="px-6 py-5">
        <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
          <FieldGroup>
            <AppField
              v-bind="ctrl.fields.itemId"
              :options="ctrl.itemOptions.value"
              placeholder="Select Item..."
            />
            <AppField
              v-bind="ctrl.fields.warehouseId"
              :options="ctrl.warehouseOptions.value"
              placeholder="Select Warehouse..."
            />
          </FieldGroup>
          <FieldGroup>
            <AppField v-bind="ctrl.fields.quantity" />
            <AppField v-bind="ctrl.fields.totalValue" />
          </FieldGroup>
        </AppTemplate>
      </div>
    </template>
  </div>
</template>
