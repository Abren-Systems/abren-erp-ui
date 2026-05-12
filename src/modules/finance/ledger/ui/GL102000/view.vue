<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup } from '@/shared/components/field-system'

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <!-- Header -->

    <!-- Toolbar -->

    <!-- Main Content -->
    <div class="px-[var(--layout-gutter)] py-5">
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
