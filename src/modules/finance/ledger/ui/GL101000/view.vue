<script setup lang="ts">
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { useLedgerSettingsController } from './controller'

const ctrl = useLedgerSettingsController()
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Header -->
    <FormTitleBar :form-title="ctrl.screen.titleKey" />

    <!-- Toolbar -->
    <FormToolbar
      :model="ctrl.model.value"
      :executors="ctrl.commands.value"
      :is-pending="ctrl.isPending.value"
      :is-new="false"
      @save="ctrl.handleSave"
    />

    <!-- Main Content -->
    <div class="px-6 py-5">
      <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
        <FieldGroup title="Account Mappings">
          <AppField
            v-bind="ctrl.fields.default_bridge_account_id"
            :editor-attrs="{ options: ctrl.accountOptions.value }"
          />
          <AppField
            v-bind="ctrl.fields.pr_payable_account_id"
            :editor-attrs="{ options: ctrl.accountOptions.value }"
          />
        </FieldGroup>
      </AppTemplate>
    </div>
  </div>
</template>
