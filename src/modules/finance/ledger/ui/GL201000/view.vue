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
      <div class="px-6 py-5">
        <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
          <FieldGroup>
            <AppField v-bind="ctrl.fields.code" />
            <AppField v-bind="ctrl.fields.name" />
            <AppField v-bind="ctrl.fields.isActive" />
          </FieldGroup>
          <FieldGroup>
            <AppField v-bind="ctrl.fields.type" />
            <AppField v-bind="ctrl.fields.currency" />
          </FieldGroup>
        </AppTemplate>
      </div>
    </template>
  </div>
</template>
