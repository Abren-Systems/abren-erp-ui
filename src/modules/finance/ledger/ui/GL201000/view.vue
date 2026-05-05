<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { useAccountController } from './controller'

const props = defineProps<{ id: string }>()

const ctrl = useAccountController(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value" class="p-8">
      Loading account details...
    </div>

    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.entity.value?.name"
        back-route="LedgerCoa"
      />

      <FormToolbar
        v-if="!ctrl.isNew.value"
        :commands="ctrl.screen.commands"
        :domain-state="ctrl.entity.value?.isActive ? 'ACTIVE' : 'INACTIVE'"
        :executors="ctrl.commands.value"
        :is-pending="ctrl.isPending.value"
        :is-new="ctrl.isNew.value"
      />

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
