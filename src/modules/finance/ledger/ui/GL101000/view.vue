<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { ScreenControllerKey } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup } from '@/shared/components/field-system'
import { useLedgerSettingsController } from './controller'

const ctrl = inject(ScreenControllerKey)!.value! as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Header -->

    <!-- Toolbar -->

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
