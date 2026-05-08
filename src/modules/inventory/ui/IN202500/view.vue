<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { useStockItemController } from './controller'

const props = defineProps<{ id: string }>()
const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <template>
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
