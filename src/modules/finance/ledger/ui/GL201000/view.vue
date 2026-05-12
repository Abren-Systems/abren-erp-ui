<script setup lang="ts">
import { useScreenControllerContext } from '@/platform/screen-runtime'
import { DataGrid, BadgeCell } from '@/shared/components/data-grid'
import { AppButton, AppInput } from '@/shared/components/primitives'
import { Plus, RefreshCcw, Calendar, X } from 'lucide-vue-next'
import { fiscalPeriodColumns } from '../grids/fiscal-period.grid'
import { usePermissions } from '@/shared/auth/usePermissions'

/**
 * GL201000: Fiscal Calendar
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
      <div
        class="p-[var(--layout-gutter)] flex items-center justify-between border-b border-[var(--app-border)]"
      >
        <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
          Fiscal Years
        </h2>
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
          <div class="flex flex-col items-start gap-0.5 flex-1 min-w-0">
            <span class="truncate font-medium">FY {{ year.year }}</span>
            <span
              class="text-[9px] font-bold uppercase tracking-tighter"
              :class="[
                year.status === 'OPEN'
                  ? 'text-[var(--app-success)]'
                  : year.status === 'CLOSED'
                    ? 'text-[var(--app-text-muted)]'
                    : 'text-[var(--app-danger)]',
              ]"
            >
              {{ year.status }}
            </span>
          </div>
        </button>

        <div
          v-if="!ctrl.years.value?.length && !ctrl.isLoading.value"
          class="p-0 text-center text-xs text-[var(--app-text-muted)] italic"
        >
          No fiscal years generated yet.
        </div>
      </div>
    </div>

    <!-- Right Detail Content -->
    <div class="flex-1 bg-[var(--app-canvas)] overflow-hidden flex flex-col">
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
        :meta="{ closePeriod: ctrl.closePeriod, lockPeriod: ctrl.lockPeriod }"
        placeholder="Search periods..."
        class="flex-1 min-h-0"
      >
        <template #toolbar>
          <div class="flex items-center gap-[var(--layout-gutter)] ml-2 mr-auto">
            <div class="flex items-center gap-2">
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
                >Year Status:</span
              >
              <BadgeCell
                :status="ctrl.selectedYear.value.status"
                :variants="{
                  OPEN: 'default',
                  CLOSED: 'secondary',
                  LOCKED: 'destructive',
                }"
              />
            </div>

            <div
              v-if="hasPermission('ledger:manage_fiscal_years')"
              class="flex items-center gap-1 border-l border-[var(--app-border)] pl-4"
            >
              <AppButton
                v-if="ctrl.canCloseYear.value"
                variant="outline"
                size="sm"
                @click="ctrl.commands.value['closeYear']?.execute()"
              >
                Close Year
              </AppButton>
              <AppButton
                v-if="ctrl.canLockYear.value"
                variant="outline"
                size="sm"
                @click="ctrl.commands.value['lockYear']?.execute()"
              >
                Lock Year
              </AppButton>
            </div>
          </div>

          <AppButton variant="stealth" @click="ctrl.commands.value['refresh']?.execute()">
            <template #start>
              <RefreshCcw :class="['h-3.5 w-3.5', ctrl.isLoading.value && 'animate-spin']" />
            </template>
            Refresh
          </AppButton>
        </template>
      </DataGrid>

      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div
          class="h-20 w-20 rounded-full bg-[var(--app-surface-subtle)] flex items-center justify-center mb-6"
        >
          <Calendar :size="40" class="text-[var(--app-text-muted)] opacity-30" />
        </div>
        <h3 class="text-xl font-bold text-[var(--app-text-primary)] mb-2">No Year Selected</h3>
        <p class="text-sm text-[var(--app-text-muted)] max-w-xs mb-8 leading-relaxed">
          Select a fiscal year from the sidebar to view periods, or go to Financial Year setup to
          generate a new year.
        </p>
        <AppButton variant="primary" :to="{ name: 'LedgerFinancialYear' }">
          <template #start><Plus :size="18" /></template>
          Setup Financial Year
        </AppButton>
      </div>
    </div>
  </div>
</template>
