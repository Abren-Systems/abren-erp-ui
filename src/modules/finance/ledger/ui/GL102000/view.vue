<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { DataGrid } from '@/shared/components/data-grid'
import { AppButton, AppInput, AppDrawer } from '@/shared/components/primitives'
import { Plus, RefreshCcw, Calendar } from 'lucide-vue-next'
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

    <!-- Right Detail View: Fiscal Periods -->
    <div class="min-w-0 flex-1 flex flex-col">
      <div class="p-8 flex-1 min-h-0 flex flex-col gap-6">
        <div v-if="ctrl.selectedYear.value" class="flex flex-col gap-1">
          <h1 class="text-2xl font-bold tracking-tight text-[var(--app-text)]">
            Fiscal Year {{ ctrl.selectedYear.value.year }}
          </h1>
          <div class="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
            <Calendar :size="14" />
            <span
              >{{ ctrl.selectedYear.value.startDate }} — {{ ctrl.selectedYear.value.endDate }}</span
            >
          </div>
        </div>

        <DataGrid
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
      </div>
    </div>

    <!-- Generate Year Drawer -->
    <AppDrawer v-model:open="ctrl.isGenerateOpen.value" title="Generate Fiscal Year" size="sm">
      <div class="flex flex-col gap-6 p-6">
        <p class="text-sm text-[var(--app-text-muted)] leading-relaxed">
          Generating a new fiscal year will automatically create 12 standard monthly periods.
          Standard Gregorian calendar is used by default.
        </p>

        <div class="flex flex-col gap-4">
          <AppInput
            v-model="ctrl.fields.genYear.value"
            label="Year (YYYY)"
            placeholder="e.g. 2026"
            :field="ctrl.fields.registry.year"
          />
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

        <div class="flex gap-3 pt-6 mt-2 border-t border-[var(--app-border)]">
          <AppButton class="flex-1" variant="outline" @click="ctrl.isGenerateOpen.value = false">
            Cancel
          </AppButton>
          <AppButton
            class="flex-1"
            variant="primary"
            :loading="ctrl.isLoading.value"
            :disabled="!ctrl.isGenerateValid.value"
            @click="ctrl.commands.value['executeGenerate']?.execute()"
          >
            Generate Calendar
          </AppButton>
        </div>
      </div>
    </AppDrawer>
  </div>
</template>
