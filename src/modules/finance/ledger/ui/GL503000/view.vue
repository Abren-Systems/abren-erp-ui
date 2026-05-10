<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton, AppSelect, AppLabel } from '@/shared/components/primitives'
import { Play, AlertCircle } from 'lucide-vue-next'
import { fiscalPeriodProcessColumns } from '../grids/fiscal-period-process.grid'
const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any

const actionOptions = [
  { value: 'CLOSE', label: 'Close' },
  { value: 'OPEN', label: 'Open' },
  { value: 'LOCK', label: 'Lock' },
  { value: 'UNLOCK', label: 'Unlock' },
]
</script>

<template>
  <div class="flex flex-col h-full bg-[var(--app-canvas)]">
    <!-- Header: Selection Criteria -->
    <div class="p-6 bg-[var(--app-surface)] border-b border-[var(--app-border)] shadow-sm">
      <div class="max-w-5xl mx-auto flex flex-wrap items-end gap-6">
        <div class="flex flex-col gap-2 min-w-[200px]">
          <AppLabel :field="ctrl.fields.registry.action" />
          <AppSelect
            v-model="ctrl.selectedAction.value"
            :options="actionOptions"
            :field="ctrl.fields.registry.action"
          />
        </div>

        <div class="flex flex-col gap-2 min-w-[200px]">
          <AppLabel :field="ctrl.fields.registry.fiscalYear" />
          <AppSelect
            v-model="ctrl.selectedYearId.value"
            :options="ctrl.years.value?.map((y) => ({ value: y.id, label: `FY ${y.year}` })) || []"
            :field="ctrl.fields.registry.fiscalYear"
            :loading="ctrl.isLoading.value"
          />
        </div>

        <div class="flex-1" />

        <div
          class="flex items-center gap-3 bg-[var(--app-surface-subtle)] px-4 py-2 rounded-lg border border-[var(--app-border)]"
        >
          <AlertCircle :size="16" class="text-[var(--app-primary)]" />
          <span class="text-xs text-[var(--app-text-muted)] font-medium">
            Only periods compatible with the selected action are shown.
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content: Process Grid -->
    <div class="flex-1 min-h-0 relative">
      <DataGrid
        v-model:sorting="ctrl.gridState.sorting.value"
        v-model:row-selection="ctrl.gridState.rowSelection.value"
        v-model:column-visibility="ctrl.gridState.columnVisibility.value"
        v-model:global-filter="ctrl.gridState.globalFilter.value"
        :columns="fiscalPeriodProcessColumns"
        :data="ctrl.dataSource.entity.value"
        :loading="ctrl.isLoading.value"
        selectable
        class="h-full"
      />

      <!-- Floating Process Bar -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-full opacity-0"
      >
        <div
          v-if="Object.keys(ctrl.gridState.rowSelection.value).length > 0"
          class="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            class="bg-[var(--app-surface)] border border-[var(--app-border)] shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-8 w-8 rounded-full bg-[var(--app-primary)] flex items-center justify-center text-white font-bold text-xs"
              >
                {{ Object.keys(ctrl.gridState.rowSelection.value).length }}
              </div>
              <span class="text-sm font-semibold text-[var(--app-text)]"> Periods Selected </span>
            </div>

            <div class="h-6 w-px bg-[var(--app-border)]" />

            <div class="flex items-center gap-2">
              <AppButton
                variant="primary"
                size="sm"
                :loading="ctrl.isProcessing.value"
                @click="ctrl.commands.value['process']?.execute()"
              >
                <template #start><Play :size="14" /></template>
                Process Selected
              </AppButton>

              <AppButton
                variant="stealth"
                size="sm"
                @click="ctrl.gridState.rowSelection.value = {}"
              >
                Clear
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Status Bar -->
    <div
      class="px-6 py-2 bg-[var(--app-surface)] border-t border-[var(--app-border)] flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-[var(--app-text-muted)]"
    >
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5">
          <div class="h-1.5 w-1.5 rounded-full bg-[var(--app-success)]" />
          Ready
        </span>
        <span v-if="ctrl.isLoading.value" class="animate-pulse text-[var(--app-primary)]">
          Syncing with Ledger...
        </span>
      </div>
      <span>Abren ERP • Financial Systems</span>
    </div>
  </div>
</template>
