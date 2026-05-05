<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, AppTemplate } from '@/platform/chrome'
import { useWarehouseController } from './controller'
import { AppButton, AppInput } from '@/shared/components/primitives'

const props = defineProps<{ id: string }>()
const ctrl = useWarehouseController(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value && !ctrl.isNew.value" class="p-8">
      Loading warehouse...
    </div>

    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.isNew.value ? 'New Warehouse' : ctrl.entity.value?.name"
        back-route="inventory.warehouses"
      />

      <!-- Detail View -->
      <template v-if="!ctrl.isNew.value">
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

      <!-- Creation View -->
      <template v-else>
        <div class="flex-1 overflow-y-auto p-6 bg-white">
          <div class="max-w-md space-y-4">
            <AppInput v-model="ctrl.form.value.code" label="Warehouse Code" required />
            <AppInput v-model="ctrl.form.value.name" label="Name" required />

            <div class="flex items-center gap-2 mt-4">
              <input type="checkbox" id="isQuarantine" v-model="ctrl.form.value.isQuarantine" />
              <label for="isQuarantine" class="text-sm">Quarantine Area</label>
            </div>

            <AppButton :loading="ctrl.isCreating.value" @click="ctrl.handleSubmit" class="mt-6">
              Create Warehouse
            </AppButton>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
