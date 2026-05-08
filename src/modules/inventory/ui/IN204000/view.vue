<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { useWarehouseController } from './controller'

const props = defineProps<{ id: string }>()
const ctrl = useWarehouseController(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <FormTitleBar
      :form-title="ctrl.screen.titleKey"
      :record-title="ctrl.isNew.value ? 'New Warehouse' : ctrl.entity.value?.name"
      back-route="inventory.warehouses"
    />

    <FormToolbar
      :model="ctrl.model.value"
      :executors="ctrl.commands.value"
      :is-pending="ctrl.isPending.value"
      :is-new="ctrl.isNew.value"
      @save="ctrl.handleSave"
    />

    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading warehouse...
    </div>

    <template v-else>
      <div class="px-6 py-5">
        <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
          <FieldGroup>
            <AppField v-bind="ctrl.fields.code" />
            <AppField v-bind="ctrl.fields.name" />
          </FieldGroup>
          <FieldGroup>
            <AppField v-bind="ctrl.fields.isQuarantine" />
            <AppField v-bind="ctrl.fields.isActive" />
          </FieldGroup>
        </AppTemplate>
      </div>
    </template>
  </div>
</template>
