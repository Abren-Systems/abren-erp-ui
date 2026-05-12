<script setup lang="ts">
import { AppTemplate } from '@/platform/chrome'
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { inject } from 'vue'
import { AppField, FieldGroup, AppTabs } from '@/shared/components/field-system'
import { DataGrid } from '@/shared/components/data-grid'
import { journalLineColumns } from './grids/lines.grid'

const props = defineProps<{ id: string }>()

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--color-neutral-50)]">
    <!-- Loading State -->

    <!-- Main Content -->
    <template>
      <!-- Summary Area -->
      <div class="px-[var(--layout-gutter)] py-5">
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
      <div class="px-[var(--layout-gutter)]">
        <AppTabs :tabs="['Journal Lines']" v-model="ctrl.activeTab.value" />
      </div>

      <!-- Details Area -->
      <div class="px-[var(--layout-gutter)] pb-6 flex-1 overflow-hidden">
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
