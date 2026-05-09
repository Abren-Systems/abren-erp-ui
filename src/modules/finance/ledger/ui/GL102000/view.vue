<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton, AppInput } from '@/shared/components/primitives'
import { Plus, RefreshCcw, Calendar, X } from 'lucide-vue-next'
import { fiscalPeriodColumns } from '../grids/fiscal-period.grid'
import { usePermissions } from '@/shared/auth/usePermissions'

/**
 * GL102000: Fiscal Calendar
 *
 * Master-Detail view:
 * - Left: Sidebar with list of Fiscal Years.
 * - Right: DataGrid with periods for the selected year.
 *
 * Hierarchy: FiscalYear (1) -> FiscalPeriod (N)
 */

const ctrl = useScreenControllerContext() as any // eslint-disable-line @typescript-eslint/no-explicit-any
const { hasPermission } = usePermissions()
</script>

<template>
  <div class="flex h-full bg-[var(--app-canvas)]">
    <!-- Left Master Sidebar: Fiscal Years -->
    <div class="w-64 border-r border-[var(--app-border)] bg-[var(--app-surface)] flex flex-col">
      <div class="p-4 flex items-center justify-between border-b border-[var(--app-border)]">
        <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
          Fiscal Years
        </h2>
        <AppButton
          v-if="hasPermission('ledger:manage_accounts')"
          variant="stealth"
          size="sm"
          @click="ctrl.commands.value['create']?.execute()"
        >
          <Plus :size="14" />
        </AppButton>
      </div>

      <div class="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        <button
          v-for="year in ctrl.years.value"
          :key="year.id"
          class="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-all group"
          :class="[
            ctrl.selectedYearId.value === year.id
              ? 'bg-[var(--app-primary-muted)] text-[var(--app-primary)] shadow-sm'
              : 'text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]',
          ]"
          @click="ctrl.selectedYearId.value = year.id"
        >
          <Calendar
            :size="16"
            :class="
              ctrl.selectedYearId.value === year.id
                ? 'text-[var(--app-primary)]'
                : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'
            "
          />
          <span>FY {{ year.year }}</span>
        </button>

        <div
          v-if="!ctrl.years.value?.length && !ctrl.isLoading.value"
          class="p-8 text-center text-xs text-[var(--app-text-muted)] italic"
        >
          No fiscal years generated yet.
        </div>
      </div>
    </div>

    <!-- Right Detail Content -->
    <div class="flex-1 bg-[var(--app-canvas)] overflow-hidden flex flex-col">
      <!-- Generation Form (Inline Mode) -->
      <div
        v-if="ctrl.isGenerateOpen.value"
        class="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--app-surface-subtle)]/50 overflow-y-auto"
      >
        <div
          class="w-full max-w-md bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)] shadow-xl p-8 flex flex-col gap-8"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 text-[var(--app-primary)]">
              <Plus :size="24" />
              <h2 class="text-xl font-bold">Generate Fiscal Year</h2>
            </div>
            <AppButton variant="stealth" size="sm" @click="ctrl.isGenerateOpen.value = false">
              <X :size="20" />
            </AppButton>
          </div>

          <p class="text-sm text-[var(--app-text-muted)] leading-relaxed">
            Generate a new financial year with 12 standard monthly periods. This action is atomic
            and will provision the entire calendar year.
          </p>

          <div class="flex flex-col gap-6">
            <AppInput
              v-model="ctrl.fields.genYear.value"
              label="Fiscal Year (YYYY)"
              placeholder="e.g. 2026"
              :field="ctrl.fields.registry.year"
            />
            <div class="grid grid-cols-2 gap-4">
              <AppInput
                v-model="ctrl.fields.genStartDate.value"
                label="Start Date"
                type="date"
                :field="ctrl.fields.registry.startDate"
              />
              <AppInput
                v-model="ctrl.fields.genEndDate.value"
                label="End Date"
                type="date"
                :field="ctrl.fields.registry.endDate"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-6 border-t border-[var(--app-border)]">
            <AppButton class="flex-1" variant="outline" @click="ctrl.isGenerateOpen.value = false">
              Discard
            </AppButton>
            <AppButton
              class="flex-1"
              variant="primary"
              :loading="ctrl.isLoading.value"
              :disabled="!ctrl.isGenerateValid.value"
              @click="ctrl.commands.value['executeGenerate']?.execute()"
            >
              Generate Now
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Fiscal Period Grid -->
      <DataGrid
        v-else-if="ctrl.selectedYear.value"
        v-model:sorting="ctrl.gridState.sorting"
        v-model:row-selection="ctrl.gridState.rowSelection"
        v-model:column-visibility="ctrl.gridState.columnVisibility"
        v-model:global-filter="ctrl.gridState.globalFilter"
        :columns="fiscalPeriodColumns"
        :data="ctrl.selectedYear.value?.periods ?? []"
        :loading="ctrl.isLoading.value"
        placeholder="Search periods..."
        class="flex-1 min-h-0"
      >
        <template #toolbar>
          <AppButton variant="stealth" @click="ctrl.commands.value['refresh']?.execute()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>
      </DataGrid>

      <!-- Empty State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div
          class="h-20 w-20 rounded-full bg-[var(--app-surface-subtle)] flex items-center justify-center mb-6"
        >
          <Calendar :size="40" class="text-[var(--app-text-muted)] opacity-30" />
        </div>
        <h3 class="text-xl font-bold text-[var(--app-text-primary)] mb-2">No Year Selected</h3>
        <p class="text-sm text-[var(--app-text-muted)] max-w-xs mb-8 leading-relaxed">
          Select a fiscal year from the sidebar to view periods, or generate a new year to get
          started.
        </p>
        <AppButton variant="primary" @click="ctrl.isGenerateOpen.value = true">
          <template #start><Plus :size="18" /></template>
          Generate New Fiscal Year
        </AppButton>
      </div>
    </div>
  </div>
</template>
