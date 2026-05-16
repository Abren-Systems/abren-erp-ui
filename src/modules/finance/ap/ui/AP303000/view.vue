<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { AppField, FieldGroup } from '@/shared/components/field-system'

const props = defineProps<{ id: string }>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctrl = useScreenControllerContext() as any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <!-- Main Content -->
    <div class="px-[var(--layout-gutter)] py-3">
      <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
        <!-- Column 1 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.name" />
          <AppField v-bind="ctrl.fields.status" :context="{ entity: 'Vendor' }" />
        </FieldGroup>

        <!-- Column 2 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.tin" />
          <AppField v-bind="ctrl.fields.trade_license_number" />
        </FieldGroup>

        <!-- Column 3 -->
        <FieldGroup>
          <AppField v-bind="ctrl.fields.has_tin_certificate" />
          <AppField v-bind="ctrl.fields.has_valid_trade_license" />
        </FieldGroup>
      </AppTemplate>
    </div>
  </div>
</template>
