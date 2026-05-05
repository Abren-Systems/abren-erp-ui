<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, AppTemplate } from '@/platform/chrome'
import { useStockItemController } from './controller'

const props = defineProps<{ id: string }>()
const ctrl = useStockItemController(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading stock item...
    </div>

    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="
          ctrl.isNew.value ? 'New Stock Position' : ctrl.entity.value?.itemId.slice(0, 8)
        "
        back-route="inventory.stock"
      />

      <div class="px-6 py-5">
        <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
          <FieldGroup>
            <AppField v-bind="ctrl.fields.itemId" />
            <AppField v-bind="ctrl.fields.warehouseId" />
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
