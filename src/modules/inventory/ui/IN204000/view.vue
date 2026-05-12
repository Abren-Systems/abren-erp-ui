<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup } from '@/shared/components/field-system'

const props = defineProps<{ id: string }>()
const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <template>
      <div class="px-[var(--layout-gutter)] py-5">
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
