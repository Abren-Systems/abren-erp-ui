<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup } from '@/shared/components/field-system'

const props = defineProps<{ id: string }>()
const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <template>
      <div class="px-[var(--layout-gutter)] py-5">
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
