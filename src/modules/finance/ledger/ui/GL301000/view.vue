<script setup lang="ts">
import { AppField, FieldGroup, AppTabs } from '@/shared/components/field-system'
import { DataGrid } from '@/shared/components/data-grid'
import { FormTitleBar, FormToolbar, AppTemplate } from '@/platform/chrome'
import { journalLineColumns } from './grids/lines.grid'
import { useJournalEntryController } from './controller'

const props = defineProps<{ id: string }>()

const ctrl = useJournalEntryController(props.id)
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Loading State -->
    <div v-if="ctrl.isLoading.value && !ctrl.entity.value" class="p-8">
      Loading journal entry details...
    </div>

    <!-- Main Content -->
    <template v-else>
      <FormTitleBar
        :form-title="ctrl.screen.titleKey"
        :record-title="ctrl.entity.value?.entryNumber"
        back-route="LedgerJournals"
      />

      <FormToolbar
        v-if="!ctrl.isNew.value"
        :model="ctrl.model.value"
        :executors="ctrl.commands.value"
        :is-pending="ctrl.isPending.value"
        :is-new="ctrl.isNew.value"
      />

      <!-- Summary Area -->
      <div class="px-6 py-5">
        <AppTemplate :template="ctrl.screen.layout.summaryTemplate">
          <FieldGroup>
            <AppField v-bind="ctrl.fields.entryDate" />
            <AppField v-bind="ctrl.fields.description" />
          </FieldGroup>
          <FieldGroup>
            <AppField v-bind="ctrl.fields.status" :context="{ entity: 'JournalEntry' }" />
            <AppField v-bind="ctrl.fields.entryNumber" />
          </FieldGroup>
        </AppTemplate>
      </div>

      <!-- Tabs -->
      <div class="px-6">
        <AppTabs :tabs="['Journal Lines']" v-model="ctrl.activeTab.value" />
      </div>

      <!-- Details Area -->
      <div class="px-6 pb-6 flex-1 overflow-hidden">
        <div
          v-if="ctrl.activeTab.value === 'Journal Lines'"
          class="h-full rounded-lg border border-[var(--color-neutral-200)] bg-white shadow-sm flex flex-col"
        >
          <DataGrid
            :columns="journalLineColumns"
            :data="ctrl.currentLines.value"
            :loading="ctrl.isLoading.value"
            empty-message="No line items found"
          />
        </div>
      </div>
    </template>
  </div>
</template>
